import { NextRequest, NextResponse } from "next/server";
import { getPluginManager, PluginManifest } from "@/lib/plugin-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const pm = getPluginManager();

export async function GET() {
  try {
    const manifests = await pm.scan();
    const loaded = pm.getLoaded();

    const plugins = manifests.map((m) => ({
      ...m,
      loaded: loaded.some((l) => l.manifest.id === m.id),
    }));

    return NextResponse.json({ plugins, count: plugins.length });
  } catch (error) {
    console.error("Failed to list plugins:", error);
    return NextResponse.json({ error: "Failed to list plugins" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, pluginId, url } = body;

    switch (action) {
      case "reload": {
        const count = await pm.reloadAll();
        return NextResponse.json({ success: true, loaded: count });
      }

      case "toggle": {
        if (!pluginId) {
          return NextResponse.json({ error: "Missing pluginId" }, { status: 400 });
        }
        const enabled = body.enabled !== false;
        const result = await pm.toggle(pluginId, enabled);
        return NextResponse.json({ success: result, pluginId, enabled });
      }

      case "install": {
        if (!url) {
          return NextResponse.json({ error: "Missing install URL" }, { status: 400 });
        }
        // Placeholder: download and extract plugin from URL
        // In production, this would download a plugin archive and extract it to plugins/
        return NextResponse.json({
          success: true,
          message: `Plugin installation from ${url} initiated. Manual installation is required for now.`,
        });
      }

      case "uninstall": {
        if (!pluginId) {
          return NextResponse.json({ error: "Missing pluginId" }, { status: 400 });
        }
        await pm.unload(pluginId);
        // In production, also delete plugin directory
        return NextResponse.json({ success: true, pluginId });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("Plugin API error:", error);
    return NextResponse.json({ error: "Plugin operation failed" }, { status: 500 });
  }
}
