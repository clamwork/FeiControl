import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);
const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";

export async function GET() {
  try {
    // ── CPU ──────────────────────────────────────────────────────────────────
    const cpuCount = os.cpus().length;
    const loadAvg = os.loadavg();
    const cpuUsage = Math.min(Math.round((loadAvg[0] / cpuCount) * 100), 100);

    // ── RAM ──────────────────────────────────────────────────────────────────
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // ── Disk ─────────────────────────────────────────────────────────────────
    let diskTotal = 0;
    let diskUsed = 0;
    let diskFree = 0;
    try {
      if (isWindows) {
        // Windows 系统使用 wmic 命令获取磁盘信息
        const { stdout } = await execAsync('wmic logicaldisk where "DeviceID=\'C:\'" get Size,FreeSpace');
        const lines = stdout.trim().split('\n');
        if (lines.length > 1) {
          const dataLine = lines[1].trim();
          const [freeSpaceStr, sizeStr] = dataLine.split(/\s+/).filter(Boolean);
          if (freeSpaceStr && sizeStr) {
            const freeSpace = parseInt(freeSpaceStr);
            const totalSpace = parseInt(sizeStr);
            diskTotal = Math.round(totalSpace / 1024 / 1024 / 1024);
            diskFree = Math.round(freeSpace / 1024 / 1024 / 1024);
            diskUsed = diskTotal - diskFree;
          }
        }
      } else {
        // Unix/Linux/macOS 系统使用 df 命令
        const dfCmd = isMac ? "df -g / | tail -1" : "df -BG / | tail -1";
        const { stdout } = await execAsync(dfCmd);
        const parts = stdout.trim().split(/\s+/);
        diskTotal = parseInt(parts[1].replace("G", ""));
        diskUsed = parseInt(parts[2].replace("G", ""));
        diskFree = parseInt(parts[3].replace("G", ""));
      }
    } catch {
      // disk stats unavailable
    }
    const diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

    return NextResponse.json({
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().map((c) => Math.round(c.times ? ((c.times.user + c.times.sys) / (c.times.user + c.times.sys + c.times.idle)) * 100 : 0)),
        loadAvg,
      },
      ram: {
        total: parseFloat((totalMem / 1024 / 1024 / 1024).toFixed(2)),
        used: parseFloat((usedMem / 1024 / 1024 / 1024).toFixed(2)),
        free: parseFloat((freeMem / 1024 / 1024 / 1024).toFixed(2)),
      },
      disk: {
        total: diskTotal,
        used: diskUsed,
        free: diskFree,
        percent: Math.round(diskPercent),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching system monitor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch system monitor data" },
      { status: 500 }
    );
  }
}
