"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Blocks, RefreshCw, ToggleLeft, ToggleRight, Download, Trash2, Globe, Loader2 } from "lucide-react";

interface PluginItem {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  enabled: boolean;
  loaded: boolean;
}

export default function PluginsPage() {
  const { t } = useI18n();
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [installUrl, setInstallUrl] = useState("");
  const [showInstall, setShowInstall] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchPlugins = async () => {
    try {
      const res = await fetch("/api/plugins");
      if (res.ok) {
        const data = await res.json();
        setPlugins(data.plugins || []);
      }
    } catch (e) {
      console.error("Failed to fetch plugins:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlugins(); }, []);

  const handleToggle = async (pluginId: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", pluginId, enabled }),
      });
      if (res.ok) {
        setPlugins((prev) =>
          prev.map((p) => (p.id === pluginId ? { ...p, enabled, loaded: enabled } : p))
        );
      }
    } catch (e) {
      console.error("Failed to toggle plugin:", e);
    }
  };

  const handleReload = async () => {
    setReloading(true);
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reload" }),
      });
      if (res.ok) {
        setMessage(t("plugins.reloaded"));
        await fetchPlugins();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      console.error("Failed to reload plugins");
    } finally {
      setReloading(false);
    }
  };

  const handleInstall = async () => {
    if (!installUrl.trim()) return;
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "install", url: installUrl.trim() }),
      });
      if (res.ok) {
        setMessage(`Installation from ${installUrl} initiated`);
        setInstallUrl("");
        setShowInstall(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      console.error("Failed to install plugin");
    }
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "uninstall", pluginId }),
      });
      if (res.ok) {
        setPlugins((prev) => prev.filter((p) => p.id !== pluginId));
      }
    } catch {
      console.error("Failed to uninstall plugin");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          <Blocks className="inline-block w-6 h-6 mr-2" style={{ color: "var(--accent)" }} />
          {t("plugins.title")}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstall(!showInstall)}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-opacity"
            style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            <Download className="w-4 h-4" />
            {t("plugins.install")}
          </button>
          <button
            onClick={handleReload}
            disabled={reloading}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-opacity"
            style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} />
            {t("plugins.reload")}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "var(--positive)", border: "1px solid rgba(34,197,94,0.3)" }}>
          {message}
        </div>
      )}

      {/* Install panel */}
      {showInstall && (
        <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            <Globe className="w-4 h-4 inline-block mr-1.5" />
            {t("plugins.install_from")}
          </h3>
          <div className="flex gap-2">
            <input
              value={installUrl}
              onChange={(e) => setInstallUrl(e.target.value)}
              placeholder="https://example.com/plugin.zip"
              className="flex-1 p-2 rounded-lg text-sm"
              style={{ backgroundColor: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            />
            <button
              onClick={handleInstall}
              disabled={!installUrl.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "var(--accent)", color: "white" }}
            >
              {t("plugins.install")}
            </button>
          </div>
        </div>
      )}

      {plugins.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <Blocks className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t("plugins.no_plugins")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="p-5 rounded-xl transition-shadow hover:shadow-lg"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: plugin.enabled ? "rgba(99,102,241,0.15)" : "var(--surface-elevated)" }}
                >
                  {plugin.icon || "🧩"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {plugin.name}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-muted)" }}>
                      v{plugin.version}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        plugin.enabled
                          ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
                          : "text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800"
                      }`}
                    >
                      {plugin.enabled ? t("plugins.enabled") : t("plugins.disabled")}
                    </span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                    {plugin.description}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {t("plugins.author")}: {plugin.author}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(plugin.id, !plugin.enabled)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: plugin.enabled ? "var(--positive)" : "var(--text-muted)" }}
                    title={plugin.enabled ? t("plugins.disabled") : t("plugins.enabled")}
                  >
                    {plugin.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleUninstall(plugin.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    title={t("plugins.uninstall")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
