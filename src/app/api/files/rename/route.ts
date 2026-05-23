/**
 * POST /api/files/rename — Rename a file or folder
 */
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { logActivity } from "@/lib/activities-db";
import { resolveWorkspace, resolveAndValidatePath } from "@/lib/workspace-resolver";

export async function POST(request: NextRequest) {
  try {
    const { workspace, path: filePath, newName } = await request.json();

    if (!workspace || !filePath || !newName) {
      return NextResponse.json({ error: "Missing required fields: workspace, path, newName" }, { status: 400 });
    }

    // Sanitize new name
    const sanitized = path.basename(newName.trim());
    if (!sanitized) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const base = resolveWorkspace(workspace);
    if (!base) {
      return NextResponse.json({ error: "Unknown workspace" }, { status: 400 });
    }

    const oldFullPath = resolveAndValidatePath(base, filePath);
    if (!oldFullPath) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const newFullPath = path.join(path.dirname(oldFullPath.fullPath), sanitized);

    // Check if target already exists
    try {
      await fs.access(newFullPath);
      return NextResponse.json({ error: "A file or folder with that name already exists" }, { status: 409 });
    } catch {
      // Target doesn't exist — good
    }

    await fs.rename(oldFullPath.fullPath, newFullPath);

    logActivity("file_write", `Renamed ${path.basename(filePath)} → ${sanitized} in ${workspace}`, "success", {
      metadata: { workspace, from: filePath, to: `${path.dirname(filePath)}/${sanitized}` },
    });

    return NextResponse.json({ success: true, from: filePath, to: `${path.dirname(filePath)}/${sanitized}` });
  } catch (error) {
    console.error("[rename] Error:", error);
    return NextResponse.json({ error: "Rename failed" }, { status: 500 });
  }
}
