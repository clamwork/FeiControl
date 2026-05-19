"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell, Check, CheckCheck, Trash2, X, Info, CheckCircle,
  AlertTriangle, XCircle, ArrowLeft, Search, Settings
} from "lucide-react";
import { useI18n } from "@/i18n";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Notification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

const typeConfig: Record<
  Notification["type"],
  { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; bg: string }
> = {
  info:    { icon: Info,        color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
  success: { icon: CheckCircle,  color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  warning: { icon: AlertTriangle,color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  error:   { icon: XCircle,     color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

type FilterType = "all" | "info" | "success" | "warning" | "error";

export default function NotificationsHistoryPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?limit=200");
      const data: NotificationsResponse = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Actions ────────────────────────────────────────────
  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearRead = async () => {
    await fetch("/api/notifications?action=clearRead", { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  // ── Filter & Search ────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (filter !== "all" && n.type !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filters: { key: FilterType; label: string }[] = [
    { key: "all",     label: t("notifications.filter_all") },
    { key: "info",    label: t("notifications.filter_info") },
    { key: "success", label: t("notifications.filter_success") },
    { key: "warning", label: t("notifications.filter_warning") },
    { key: "error",   label: t("notifications.filter_error") },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ── Header ───────────────────────────────────────── */}
      <div
        style={{
          padding: "24px 24px 16px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Link
            href="/"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "8px",
              backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)",
              border: "none", cursor: "pointer", textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700,
              letterSpacing: "-1px", color: "var(--text-primary)",
            }}
          >
            {t("notifications.history_title")}
          </h1>
        </div>

        {/* ── Search Bar ─────────────────────────────────── */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            backgroundColor: "var(--surface-elevated)",
            border: "1px solid var(--border)", borderRadius: "8px",
            padding: "8px 12px", marginBottom: "12px",
          }}
        >
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("notifications.search_placeholder")}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--text-primary)", fontSize: "13px",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", padding: "2px",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── Filter Tabs ────────────────────────────────── */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "5px 12px", borderRadius: "6px",
                border: filter === f.key ? "1px solid var(--accent)" : "1px solid var(--border)",
                backgroundColor: filter === f.key ? "var(--accent-soft)" : "transparent",
                color: filter === f.key ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer", fontSize: "12px", fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}

          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            <span
              style={{
                fontSize: "12px", color: "var(--text-muted)",
                display: "flex", alignItems: "center", paddingRight: "8px",
              }}
            >
              {unreadCount > 0 ? `${unreadCount} unread` : t("notifications.no_notifications")}
            </span>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title={t("notifications.mark_all_read")}
                style={{
                  padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)",
                  backgroundColor: "transparent", color: "var(--text-muted)",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                  fontSize: "11px",
                }}
              >
                <CheckCheck size={14} /> {t("notifications.mark_all_read")}
              </button>
            )}

            {notifications.some((n) => n.read) && (
              <button
                onClick={clearRead}
                title={t("notifications.clear_read")}
                style={{
                  padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)",
                  backgroundColor: "transparent", color: "var(--text-muted)",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                  fontSize: "11px",
                }}
              >
                <Trash2 size={14} /> {t("notifications.clear_read")}
              </button>
            )}

            <Link
              href="/settings"
              style={{
                padding: "5px", borderRadius: "6px", border: "1px solid var(--border)",
                backgroundColor: "transparent", color: "var(--text-muted)",
                display: "flex", alignItems: "center", cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <Settings size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Notification List ────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {loading && filtered.length === 0 && (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            Loading...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "60px 24px", color: "var(--text-muted)", textAlign: "center",
            }}
          >
            <Bell size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
            <p style={{ fontSize: "14px" }}>
              {searchQuery ? t("notifications.no_results") : t("notifications.no_notifications")}
            </p>
          </div>
        )}

        {filtered.map((notification, index) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;
          return (
            <div
              key={notification.id}
              style={{
                display: "flex", gap: "14px", padding: "14px 24px",
                borderBottom: index < filtered.length - 1 ? "1px solid var(--border)" : "none",
                backgroundColor: notification.read ? "transparent" : "rgba(96,165,250,0.04)",
                transition: "background-color 0.2s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (notification.link) {
                  e.currentTarget.style.backgroundColor = "var(--surface-hover, rgba(255,255,255,0.02))";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = notification.read
                  ? "transparent"
                  : "rgba(96,165,250,0.04)";
              }}
            >
              {/* Type Icon */}
              <div
                style={{
                  padding: "10px", borderRadius: "10px",
                  backgroundColor: config.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: "fit-content", flexShrink: 0, marginTop: "2px",
                }}
              >
                <Icon size={18} style={{ color: config.color }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between", marginBottom: "4px",
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "var(--font-heading)", fontSize: "14px",
                      fontWeight: notification.read ? 500 : 600,
                      color: "var(--text-primary)", marginBottom: "2px",
                    }}
                  >
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <div
                      style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        backgroundColor: "#60a5fa", flexShrink: 0, marginLeft: "8px", marginTop: "4px",
                      }}
                    />
                  )}
                </div>

                <p
                  style={{
                    fontSize: "13px", color: "var(--text-secondary)",
                    lineHeight: 1.5, marginBottom: "8px",
                  }}
                >
                  {notification.message}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {format(new Date(notification.timestamp), "MMM d, yyyy · HH:mm")}
                    <span style={{ marginLeft: "6px", opacity: 0.7 }}>
                      ({formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })})
                    </span>
                  </span>

                  <div style={{ display: "flex", gap: "4px" }}>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        title={t("notifications.mark_all_read")}
                        style={{
                          padding: "4px 8px", borderRadius: "4px", border: "none",
                          backgroundColor: "transparent", color: "var(--text-muted)",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                          fontSize: "11px",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface)"; e.currentTarget.style.color = "#4ade80"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <Check size={14} /> Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      title={t("notifications.delete")}
                      style={{
                        padding: "4px 8px", borderRadius: "4px", border: "none",
                        backgroundColor: "transparent", color: "var(--text-muted)",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                        fontSize: "11px",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--surface)"; e.currentTarget.style.color = "#f87171"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      <X size={14} /> {t("notifications.delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && filtered.length > 0 && (
          <div
            style={{
              padding: "16px 24px", textAlign: "center",
              fontSize: "12px", color: "var(--text-muted)",
            }}
          >
            {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
