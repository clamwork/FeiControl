"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Terminal, Server, Activity, Cpu, Globe, Loader2, RefreshCw } from "lucide-react";
import { PluginLogViewer } from "@/components/dev/PluginLogViewer";

interface SystemInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  memory: {
    total: string;
    free: string;
    usagePercent: number;
  };
  uptime: string;
  cpuCores: number;
}

interface ActivityEntry {
  type: string;
  description: string;
  status: string;
  created_at: string;
}

export default function DevConsolePage() {
  const { t } = useI18n();
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sysRes, actRes] = await Promise.all([
        fetch("/api/system"),
        fetch("/api/activities?limit=20"),
      ]);
      if (sysRes.ok) {
        const data = await sysRes.json();
        // Map from /api/system response format
        setSysInfo({
          nodeVersion: data.system?.nodeVersion || "unknown",
          platform: data.system?.platform || "unknown",
          arch: "",
          memory: {
            total: formatBytes(data.system?.memory?.total || 0),
            free: formatBytes(data.system?.memory?.free || 0),
            usagePercent: data.system?.memory?.total
              ? Math.round(((data.system.memory.total - data.system.memory.free) / data.system.memory.total) * 100)
              : 0,
          },
          uptime: data.system?.uptimeFormatted || "0s",
          cpuCores: navigator?.hardwareConcurrency || 0,
        });
      }
      if (actRes.ok) {
        const data = await actRes.json();
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error("Failed to fetch dev data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "success": case "completed": return "var(--positive)";
      case "error": case "failed": return "var(--negative)";
      case "running": case "pending": return "var(--warning)";
      default: return "var(--text-muted)";
    }
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          <Terminal className="inline-block w-6 h-6 mr-2" style={{ color: "var(--accent)" }} />
          {t("dev.title") || "Developer Console"}
        </h1>
        <button
          onClick={fetchData}
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      {/* Runtime Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("dev.runtime") || "Runtime"}
            </h2>
          </div>
          {sysInfo ? (
            <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div className="flex justify-between">
                <span>Node.js</span>
                <span style={{ color: "var(--text-primary)" }}>{sysInfo.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform</span>
                <span style={{ color: "var(--text-primary)" }}>{sysInfo.platform} {sysInfo.arch}</span>
              </div>
              <div className="flex justify-between">
                <span>CPU Cores</span>
                <span style={{ color: "var(--text-primary)" }}>{sysInfo.cpuCores}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime</span>
                <span style={{ color: "var(--text-primary)" }}>{sysInfo.uptime}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("dev.memory") || "Memory"}
            </h2>
          </div>
          {sysInfo ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>Total</span>
                <span style={{ color: "var(--text-primary)" }}>{sysInfo.memory.total}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>Free</span>
                <span style={{ color: "var(--text-primary)" }}>{sysInfo.memory.free}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>Usage</span>
                <span style={{ color: sysInfo.memory.usagePercent > 80 ? "var(--negative)" : "var(--text-primary)" }}>
                  {sysInfo.memory.usagePercent}%
                </span>
              </div>
              {/* Usage bar */}
              <div className="h-2 rounded-full" style={{ backgroundColor: "var(--surface-elevated)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(sysInfo.memory.usagePercent, 100)}%`,
                    backgroundColor: sysInfo.memory.usagePercent > 80 ? "var(--negative)" : "var(--accent)",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("dev.plugins_status") || "Plugins"}
            </h2>
          </div>
          <PluginInfo />
        </div>
      </div>

      {/* Plugin Logs */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Activity className="w-5 h-5" style={{ color: "var(--accent)" }} />
          {t("dev.plugin_logs") || "Plugin Logs"}
        </h2>
        <PluginLogViewer maxHeight="500px" />
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Activity className="w-5 h-5" style={{ color: "var(--accent)" }} />
          {t("dev.recent_activities") || "Recent Activities"}
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          {activities.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
              {t("dev.no_activities") || "No recent activities"}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: statusColor(act.status) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {act.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {act.type}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${statusColor(act.status)}15`,
                      color: statusColor(act.status),
                    }}
                  >
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Inline sub-component: show loaded plugin count + list */
function PluginInfo() {
  const [plugins, setPlugins] = useState<{ id: string; name: string; enabled: boolean; loaded: boolean }[]>([]);

  useEffect(() => {
    fetch("/api/plugins")
      .then((r) => r.json())
      .then((d) => setPlugins(d.plugins || []))
      .catch(() => {});
  }, []);

  const loaded = plugins.filter((p) => p.loaded).length;
  const total = plugins.length;

  return (
    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
      <div className="flex justify-between mb-2">
        <span>Loaded</span>
        <span style={{ color: "var(--text-primary)" }}>{loaded} / {total}</span>
      </div>
      {plugins.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No plugins</p>
      ) : (
        <div className="space-y-1">
          {plugins.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: p.loaded ? "var(--positive)" : "var(--text-muted)" }}
              />
              <span style={{ color: "var(--text-primary)" }}>{p.name}</span>
              <span style={{ color: "var(--text-muted)" }}>
                {p.enabled ? "enabled" : "disabled"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
