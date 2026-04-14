import { NextResponse } from "next/server";
import { readFileSync, statSync, readdirSync, openSync, readSync, closeSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export const dynamic = "force-dynamic";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || join(homedir(), ".openclaw");

interface AgentState {
  isActive: boolean;
  currentTask: string;
  lastSeen: number;
  status: "working" | "idle" | "sleeping";
}

/**
 * Read the last N bytes of a file efficiently (avoids reading 30MB JSONL files).
 */
function readTail(filePath: string, bytes = 8192): string[] {
  try {
    const stat = statSync(filePath);
    const fd = openSync(filePath, "r");
    const readSize = Math.min(bytes, stat.size);
    const buf = Buffer.alloc(readSize);
    readSync(fd, buf, 0, readSize, Math.max(0, stat.size - readSize));
    closeSync(fd);
    const text = buf.toString("utf-8");
    return text.split("\n").filter((l) => l.trim().length > 0);
  } catch {
    return [];
  }
}

/**
 * Check if a session JSONL's last entry indicates the session has ended.
 */
function isSessionEnded(filePath: string): boolean {
  const lines = readTail(filePath, 4096);
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
    try {
      const entry = JSON.parse(lines[i]);
      if (entry.type === "message" && entry.message?.role === "assistant") {
        // OpenClaw uses camelCase "stopReason" with value "stop"
        return !!entry.message?.stopReason || !!entry.message?.stop_reason;
      }
    } catch {
      continue;
    }
  }
  return true;
}

/**
 * Detect agent status from session files.
 * Lock files → working. File growing (size changed in last 2s) → working.
 * Modified <120s + not ended → working. <30min → idle. Else → sleeping.
 */
// Cache previous file sizes to detect active writing
const prevSizes: Record<string, { size: number; ts: number }> = {};

function getAgentStatusFromSessions(agentId: string): AgentState {
  try {
    const sessionsDir = join(OPENCLAW_DIR, "agents", agentId, "sessions");
    const files = readdirSync(sessionsDir);
    const hasLock = files.some((f) => f.endsWith(".lock"));

    let latestMtime = 0;
    let latestFile = "";
    let latestSize = 0;
    for (const file of files) {
      if (!file.endsWith(".jsonl")) continue;
      try {
        const stat = statSync(join(sessionsDir, file));
        if (stat.mtimeMs > latestMtime) {
          latestMtime = stat.mtimeMs;
          latestFile = file;
          latestSize = stat.size;
        }
      } catch { /* skip */ }
    }

    if (latestMtime === 0) {
      return { isActive: false, currentTask: "zzZ...", lastSeen: 0, status: "sleeping" };
    }

    const secsAgo = (Date.now() - latestMtime) / 1000;
    const latestPath = join(sessionsDir, latestFile);

    // Detect if file is actively growing (size changed since last check)
    const cacheKey = `${agentId}/${latestFile}`;
    const prev = prevSizes[cacheKey];
    const isGrowing = prev && latestSize > prev.size && (Date.now() - prev.ts) < 5000;
    prevSizes[cacheKey] = { size: latestSize, ts: Date.now() };

    if (hasLock || isGrowing) {
      return { isActive: true, currentTask: "Working...", lastSeen: latestMtime, status: "working" };
    }
    if (secsAgo < 120) {
      const ended = isSessionEnded(latestPath);
      if (!ended) {
        return { isActive: true, currentTask: "Working...", lastSeen: latestMtime, status: "working" };
      }
      return { isActive: false, currentTask: "Standing by", lastSeen: latestMtime, status: "idle" };
    }
    if (secsAgo < 1800) {
      return { isActive: false, currentTask: "Standing by", lastSeen: latestMtime, status: "idle" };
    }
    return { isActive: false, currentTask: "zzZ...", lastSeen: latestMtime, status: "sleeping" };
  } catch {
    return { isActive: false, currentTask: "zzZ...", lastSeen: 0, status: "sleeping" };
  }
}

/**
 * Extract latest task hint from the last user message in the session JSONL.
 */
function getLatestTaskHint(filePath: string): string | null {
  try {
    const lines = readTail(filePath, 16384);
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 20); i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.type === "message" && entry.message?.role === "user") {
          const text =
            typeof entry.message.content === "string"
              ? entry.message.content
              : entry.message.content?.[0]?.text || "";
          const taskMatch = text.match(/\[Subagent Task\]:\s*(.+?)(?:\n|$)/);
          if (taskMatch) return taskMatch[1].slice(0, 80);
          const firstLine = text.split("\n")[0].slice(0, 80);
          if (firstLine.length > 10) return firstLine;
        }
      } catch { continue; }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get session stats: count, total tokens (from file sizes as proxy), recent sessions.
 */
function getAgentSessionStats(agentId: string) {
  try {
    const sessionsDir = join(OPENCLAW_DIR, "agents", agentId, "sessions");
    const files = readdirSync(sessionsDir)
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => {
        try {
          const stat = statSync(join(sessionsDir, f));
          return { name: f, size: stat.size, mtime: stat.mtimeMs };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Array<{ name: string; size: number; mtime: number }>;

    files.sort((a, b) => b.mtime - a.mtime);

    const sessionCount = files.length;
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    // Rough token estimate: ~4 bytes per token in JSONL (includes JSON overhead)
    const totalTokens = Math.round(totalBytes / 4);

    // Get recent session hints (last 5)
    const recentSessions: Array<{ id: string; task: string; time: string }> = [];
    for (const f of files.slice(0, 5)) {
      const filePath = join(sessionsDir, f.name);
      const hint = getLatestTaskHint(filePath);
      recentSessions.push({
        id: f.name.replace(".jsonl", "").slice(0, 8),
        task: hint || "—",
        time: new Date(f.mtime).toISOString(),
      });
    }

    return { sessionCount, totalTokens, recentSessions };
  } catch {
    return { sessionCount: 0, totalTokens: 0, recentSessions: [] };
  }
}

export async function GET() {
  try {
    const configPath = join(OPENCLAW_DIR, "openclaw.json");
    
    // 检查配置文件是否存在
    if (!existsSync(configPath)) {
      console.warn(`OpenClaw 配置文件不存在: ${configPath}`);
      return NextResponse.json({ 
        agents: [], 
        timestamp: Date.now(),
        warning: "OpenClaw 配置文件未找到，请确保 OPENCLAW_DIR 环境变量已正确设置"
      });
    }
    
    const config = JSON.parse(readFileSync(configPath, "utf-8"));

    // 从 agents 目录扫描所有 agent（新版本的 OpenClaw 使用目录结构）
    const agentsDir = join(OPENCLAW_DIR, "agents");
    let agentIds: string[] = [];
    
    if (existsSync(agentsDir)) {
      agentIds = readdirSync(agentsDir)
        .filter((name: string) => {
          const fullPath = join(agentsDir, name);
          const stat = statSync(fullPath);
          return stat.isDirectory();
        });
    }
    
    // 如果也没有找到 agent 目录，尝试从配置文件读取
    if (agentIds.length === 0 && config.agents && Array.isArray(config.agents.list)) {
      agentIds = config.agents.list.map((agent: any) => agent.id);
    }
    
    // 如果仍然没有 agent，使用默认配置创建默认 agent
    if (agentIds.length === 0) {
      console.log("未找到任何 Agent，使用默认配置");
      agentIds = ["main"];
    }

    // 获取默认模型配置
    const defaultModel = typeof config.agents?.defaults?.model === "string"
      ? config.agents.defaults.model
      : config.agents?.defaults?.model?.primary;

    const agents = agentIds.map((agentId: string) => {
      try {
        const state = getAgentStatusFromSessions(agentId);
        const stats = getAgentSessionStats(agentId);

        // 尝试从 agent 目录读取配置
        const agentConfigPath = join(OPENCLAW_DIR, "agents", agentId, "agent.json");
        let agentName = agentId;
        let agentModel = defaultModel;
        
        if (existsSync(agentConfigPath)) {
          try {
            const agentConfig = JSON.parse(readFileSync(agentConfigPath, "utf-8"));
            agentName = agentConfig.name || agentId;
            const model = typeof agentConfig.model === "string"
              ? agentConfig.model
              : agentConfig.model?.primary;
            if (model) agentModel = model;
          } catch {
            // 忽略 agent 配置文件读取错误
          }
        }

        const model = (agentModel || "unknown").replace("github-copilot/", "");

        // Get task hint from latest session if active
        let taskHint: string | null = null;
        if (state.isActive) {
          const sessionsDir = join(OPENCLAW_DIR, "agents", agentId, "sessions");
          if (existsSync(sessionsDir)) {
            const files = readdirSync(sessionsDir)
              .filter((f: string) => f.endsWith(".jsonl"))
              .map((f: string) => ({ name: f, mtime: statSync(join(sessionsDir, f)).mtimeMs }))
              .sort((a: { mtime: number }, b: { mtime: number }) => b.mtime - a.mtime);
            if (files.length > 0) {
              taskHint = getLatestTaskHint(join(sessionsDir, files[0].name));
            }
          }
        }

        return {
          id: agentId,
          name: agentName,
          model,
          currentTask: taskHint || state.currentTask,
          isActive: state.isActive,
          status: state.status,
          lastSeen: state.lastSeen,
          sessionCount: stats.sessionCount,
          totalTokens: stats.totalTokens,
          recentSessions: stats.recentSessions,
        };
      } catch (agentError) {
        console.error(`处理 Agent "${agentId}" 时出错:`, agentError);
        // 返回该 agent 的基本信息，即使获取详细状态失败
        return {
          id: agentId,
          name: agentId,
          model: "unknown",
          currentTask: null,
          isActive: false,
          status: "error",
          lastSeen: 0,
          sessionCount: 0,
          totalTokens: 0,
          recentSessions: [],
          error: "获取 agent 状态失败"
        };
      }
    });

    return NextResponse.json({ agents, timestamp: Date.now() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error("获取 Office 数据时发生错误:", error);
    
    // 根据错误类型提供不同的提示
    let userMessage = "加载 Office 数据失败";
    if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
      userMessage = "OpenClaw 配置文件未找到，请检查 OPENCLAW_DIR 环境变量";
    } else if (errorMessage.includes('JSON')) {
      userMessage = "OpenClaw 配置文件格式错误，请检查 JSON 格式";
    } else if (errorMessage.includes('EACCES') || errorMessage.includes('permission')) {
      userMessage = "没有权限访问 OpenClaw 配置目录，请检查文件权限";
    }
    
    return NextResponse.json({ 
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      timestamp: Date.now() 
    }, { status: 500 });
  }
}
