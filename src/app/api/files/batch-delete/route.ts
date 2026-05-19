import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface DeleteRequestBody {
  workspace: string;
  files: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: DeleteRequestBody = await request.json();

    if (!body.workspace || !body.files || !Array.isArray(body.files) || body.files.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: workspace, files" },
        { status: 400 }
      );
    }

    // Resolve workspace path from API
    const workspacesRes = await fetch(new URL("/api/files/workspaces", request.url));
    const workspacesData = await workspacesRes.json();
    const workspaces: Array<{ id: string; path: string }> = workspacesData.workspaces || [];
    const workspace = workspaces.find((w) => w.id === body.workspace);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const results: Array<{ file: string; success: boolean; error?: string }> = [];

    for (const filePath of body.files) {
      try {
        const absolutePath = path.resolve(workspace.path, filePath);

        // Safety: ensure the resolved path is within the workspace
        if (!absolutePath.startsWith(path.resolve(workspace.path))) {
          results.push({ file: filePath, success: false, error: "Path traversal denied" });
          continue;
        }

        const stat = await fs.stat(absolutePath);
        if (stat.isDirectory()) {
          await fs.rm(absolutePath, { recursive: true, force: true });
        } else {
          await fs.unlink(absolutePath);
        }
        results.push({ file: filePath, success: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        results.push({ file: filePath, success: false, error: message });
      }
    }

    const deletedCount = results.filter((r) => r.success).length;
    return NextResponse.json({
      success: true,
      deletedCount,
      total: body.files.length,
      results,
    });
  } catch (error) {
    console.error("Batch delete failed:", error);
    return NextResponse.json(
      { error: "Failed to process batch delete" },
      { status: 500 }
    );
  }
}
