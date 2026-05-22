import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { getPersonality } from "@/lib/personality/repository";
import { buildPersonalityPrompt } from "@/lib/personality/prompt-builder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || join(homedir(), ".openclaw");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, message } = body;

    if (!agentId || !message) {
      return NextResponse.json({ error: "Missing agentId or message" }, { status: 400 });
    }

    // Read openclaw config to get agent model info
    const configPath = join(OPENCLAW_DIR, "openclaw.json");
    if (!existsSync(configPath)) {
      return NextResponse.json({ error: "OpenClaw config not found" }, { status: 500 });
    }

    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    const agent = config.agents?.list?.find((a: any) => a.id === agentId);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const model = (typeof agent.model === "string" ? agent.model : agent.model?.primary) ||
      config.agents?.defaults?.model?.primary || "claude-sonnet-4-20250514";

    // Log message to agent's workspace
    const workspace = agent.workspace || join(OPENCLAW_DIR, agentId === "main" ? "workspace" : `workspace-${agentId}`);
    const chatDir = join(workspace, "chat");
    if (!existsSync(chatDir)) {
      mkdirSync(chatDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const messageFile = join(chatDir, `message-${timestamp}.json`);
    writeFileSync(messageFile, JSON.stringify({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }, null, 2));

    // ── Inject personality prompt ──
    const personality = getPersonality(agentId);
    const personalityPrompt = buildPersonalityPrompt(personality, {
      agentName: agent.name || agentId,
    });

    // Try to send to agent via OpenClaw CLI if available
    let response = "";
    try {
      const cliPath = join(OPENCLAW_DIR, "..", "openclaw", "cli", "openclaw");
      if (existsSync(cliPath)) {
        // Inject personality into message
        const augmentedMessage = `${personalityPrompt}\n\n---\n用户消息: ${message}\n\n请根据以上【性格设定】和【语言风格】以最适合的语气回复用户。`;
        const result = execSync(
          `${cliPath} task --agent ${agentId} --task "${augmentedMessage.replace(/"/g, '\\"')}"`,
          { encoding: "utf-8", timeout: 120000 }
        );
        response = result.trim();
      } else {
        response = `[Simulated] Task sent to ${agentId} via ${model}. (人格注入: ${personality.extraversion}/${personality.conscientiousness}/${personality.humor}/${personality.empathy}/${personality.creativity})`;
      }
    } catch (execError: any) {
      response = `[Error] Failed to execute task: ${execError.message || "Unknown error"}`;
    }

    // Log response
    const responseFile = join(chatDir, `response-${timestamp}.json`);
    writeFileSync(responseFile, JSON.stringify({
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    }, null, 2));

    return NextResponse.json({
      agentId,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
