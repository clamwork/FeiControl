"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  pluginId: string;
}

interface Props {
  pluginId?: string;
  maxHeight?: string;
}

export function PluginLogViewer({ pluginId, maxHeight = "400px" }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const url = pluginId
        ? `/api/plugins/${pluginId}`
        : "/api/plugins";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();

      if (pluginId) {
        setLogs(data.logs || []);
      } else {
        // Aggregate logs from all plugins by fetching each
        const plugins = data.plugins || [];
        const allLogs: LogEntry[] = [];
        for (const p of plugins) {
          try {
            const r = await fetch(`/api/plugins/${p.id}`);
            if (r.ok) {
              const d = await r.json();
              allLogs.push(...(d.logs || []));
            }
          } catch {}
        }
        allLogs.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(allLogs.slice(0, 200));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [pluginId]);

  const levelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case "warn":
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
  };

  const levelBadge = (level: string) => {
    const styles: Record<string, string> = {
      error: "bg-red-500/10 text-red-500 border-red-500/30",
      warn: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    };
    return `px-1.5 py-0.5 rounded text-[10px] font-medium border ${styles[level] || styles.info}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32" style={{ color: "var(--text-muted)" }}>
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading logs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm" style={{ color: "var(--negative)" }}>
        Failed to load logs: {error}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm" style={{ color: "var(--text-muted)" }}>
        No logs yet
      </div>
    );
  }

  return (
    <div
      className="overflow-y-auto font-mono text-xs rounded-lg"
      style={{
        maxHeight,
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {logs.map((log, i) => (
        <div
          key={`${log.timestamp}-${i}`}
          className="flex items-start gap-2 px-3 py-1.5 border-b last:border-b-0"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="shrink-0 text-[10px]" style={{ color: "var(--text-muted)" }}>
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
          <span className={levelBadge(log.level)}>{log.level}</span>
          {!pluginId && (
            <span className="shrink-0 text-[10px] px-1 rounded" style={{ backgroundColor: "var(--surface-elevated)", color: "var(--accent)" }}>
              {log.pluginId}
            </span>
          )}
          <span className="break-all" style={{ color: "var(--text-primary)" }}>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
}
