import { NextRequest, NextResponse } from "next/server";
import { getPluginManager } from "@/lib/plugin-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pm = getPluginManager();
    const manifests = await pm.scan();
    const manifest = manifests.find((m) => m.id === id);

    if (!manifest) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }

    const loaded = pm.get(id);
    const logs = pm.getLogs(id, 100);
    const config = pm.readPluginConfig(id);

    return NextResponse.json({
      manifest,
      loaded: !!loaded,
      loadedAt: loaded?.loadedAt || null,
      errorCount: loaded?.errorCount || 0,
      logs,
      config,
    });
  } catch (error) {
    console.error("Failed to get plugin details:", error);
    return NextResponse.json({ error: "Failed to get plugin details" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pm = getPluginManager();
    const body = await request.json();
    const { action, config } = body;

    switch (action) {
      case "updateConfig": {
        if (config === undefined) {
          return NextResponse.json({ error: "Missing config data" }, { status: 400 });
        }
        const success = pm.writePluginConfig(id, config);
        return NextResponse.json({ success, config });
      }

      case "toggle": {
        const enabled = body.enabled !== false;
        const result = await pm.toggle(id, enabled);
        return NextResponse.json({ success: result, enabled });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("Plugin detail API error:", error);
    return NextResponse.json({ error: "Plugin operation failed" }, { status: 500 });
  }
}
