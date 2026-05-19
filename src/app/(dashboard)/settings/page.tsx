"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings, RefreshCw, Bell, Info, CheckCircle, AlertTriangle, XCircle, Check } from "lucide-react";
import { SystemInfo } from "@/components/SystemInfo";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { QuickActions } from "@/components/QuickActions";
import { useI18n } from "@/i18n";

interface SystemData {
  agent: {
    name: string;
    creature: string;
    emoji: string;
  };
  system: {
    uptime: number;
    uptimeFormatted: string;
    nodeVersion: string;
    model: string;
    workspacePath: string;
    platform: string;
    hostname: string;
    memory: {
      total: number;
      free: number;
      used: number;
    };
  };
  integrations: Array<{
    id: string;
    name: string;
    status: "connected" | "disconnected" | "configured" | "not_configured";
    icon: string;
    lastActivity: string | null;
  }>;
  timestamp: string;
}

export default function SettingsPage() {
  const { t } = useI18n();
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchSystemData = async () => {
    try {
      const res = await fetch("/api/system");
      const data = await res.json();
      setSystemData(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch system data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchSystemData();
  };

  // ── Notification Preferences ─────────────────────────
  const [notifPrefs, setNotifPrefs] = useState<{
    push: boolean;
    types: { info: boolean; success: boolean; warning: boolean; error: boolean };
  }>(() => {
    if (typeof window === "undefined") {
      return { push: false, types: { info: true, success: true, warning: true, error: true } };
    }
    const saved = localStorage.getItem("notification-preferences");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fall through */ }
    }
    return { push: false, types: { info: true, success: true, warning: true, error: true } };
  });

  const [prefsSaved, setPrefsSaved] = useState(false);

  const saveNotifPrefs = useCallback((newPrefs: typeof notifPrefs) => {
    setNotifPrefs(newPrefs);
    localStorage.setItem("notification-preferences", JSON.stringify(newPrefs));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  }, []);

  const togglePush = () => {
    const next = { ...notifPrefs, push: !notifPrefs.push };
    saveNotifPrefs(next);
  };

  const toggleType = (type: keyof typeof notifPrefs.types) => {
    const next = { ...notifPrefs, types: { ...notifPrefs.types, [type]: !notifPrefs.types[type] } };
    saveNotifPrefs(next);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 flex items-center gap-2 md:gap-3"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
          >
            <Settings className="w-6 h-6 md:w-8 md:h-8" style={{ color: "var(--accent)" }} />
            {t("settings.page_title")}
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            {t("settings.page_subtitle")}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto"
          style={{ 
            backgroundColor: "var(--card)", 
            color: "var(--text-secondary)",
            border: "1px solid var(--border)"
          }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("settings.refresh")}
        </button>
      </div>

      {/* Last Refresh Time */}
      {lastRefresh && (
        <div className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* System Info - Full width on first row */}
        <div className="lg:col-span-2">
          <SystemInfo data={systemData} />
        </div>

        {/* Integration Status */}
        <div>
          <IntegrationStatus integrations={systemData?.integrations || null} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions onActionComplete={handleRefresh} />
        </div>
      </div>

      {/* ── Notification Preferences ──────────────────────────── */}
      <div
        className="mt-6 md:mt-8 rounded-xl"
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--card)",
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center gap-3 p-4 md:p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Bell className="w-5 h-5 md:w-6 md:h-6" style={{ color: "var(--accent)" }} />
          <div>
            <h3
              className="font-semibold"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "16px",
                color: "var(--text-primary)",
              }}
            >
              {t("notifications.preferences")}
            </h3>
          </div>
          {prefsSaved && (
            <span
              className="flex items-center gap-1 ml-auto text-xs"
              style={{ color: "#4ade80" }}
            >
              <Check className="w-3.5 h-3.5" /> {t("notifications.saved")}
            </span>
          )}
        </div>

        <div className="p-4 md:p-5 space-y-4">
          {/* Push toggle */}
          <div
            className="flex items-center justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                {t("notifications.push_enabled")}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {t("notifications.push_description")}
              </div>
            </div>
            <button
              onClick={togglePush}
              style={{
                width: "44px", height: "24px", borderRadius: "12px",
                border: "none", cursor: "pointer", position: "relative",
                backgroundColor: notifPrefs.push ? "#4ade80" : "var(--border)",
                transition: "background-color 0.2s",
              }}
            >
              <div
                style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  backgroundColor: "#fff", position: "absolute",
                  top: "2px", left: notifPrefs.push ? "22px" : "2px",
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>

          {/* Type toggles */}
          {([
            ["info", "type_info", "type_info_desc"],
            ["success", "type_success", "type_success_desc"],
            ["warning", "type_warning", "type_warning_desc"],
            ["error", "type_error", "type_error_desc"],
          ] as const).map(([typeKey, labelKey, descKey]) => {
            const type = typeKey as keyof typeof notifPrefs.types;
            const TypeIcon =
              type === "info"
                ? Info
                : type === "success"
                ? CheckCircle
                : type === "warning"
                ? AlertTriangle
                : XCircle;
            const iconColor =
              type === "info"
                ? "#60a5fa"
                : type === "success"
                ? "#4ade80"
                : type === "warning"
                ? "#fbbf24"
                : "#f87171";
            return (
              <div
                key={type}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <TypeIcon className="w-4 h-4" style={{ color: iconColor, flexShrink: 0 }} />
                  <div>
                    <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                      {t(`notifications.${labelKey}`)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {t(`notifications.${descKey}`)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleType(type)}
                  style={{
                    width: "44px", height: "24px", borderRadius: "12px",
                    border: "none", cursor: "pointer", position: "relative",
                    backgroundColor: notifPrefs.types[type] ? "#4ade80" : "var(--border)",
                    transition: "background-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      backgroundColor: "#fff", position: "absolute",
                      top: "2px", left: notifPrefs.types[type] ? "22px" : "2px",
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div 
        className="mt-6 md:mt-8 p-3 md:p-4 rounded-xl"
        style={{ 
          backgroundColor: "rgba(26, 26, 26, 0.5)", 
          border: "1px solid var(--border)" 
        }}
      >
        <div className="flex items-center justify-between text-sm" style={{ color: "var(--text-muted)" }}>
          <span>{t("settings.version_info")}</span>
          <span>{t("settings.dashboard_name")}</span>
        </div>
      </div>
    </div>
  );
}
