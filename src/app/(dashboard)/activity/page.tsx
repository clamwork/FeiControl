"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  Clock,
  List,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
} from "lucide-react";
import { format } from "date-fns";
import { useI18n } from "@/i18n";

interface ActivityStats {
  total: number;
  today: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  heatmap: Array<{ day: string; count: number }>;
  trend: Array<{ day: string; count: number; success: number; errors: number }>;
  hourly: Array<{ hour: string; count: number }>;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  status: string;
  duration_ms: number | null;
  agent: string | null;
  timestamp: string;
}

const STATUS_COLORS: Record<string, string> = {
  success: "#22c55e",
  error: "#ef4444",
  pending: "#f59e0b",
  running: "#3b82f6",
};

const TYPE_COLORS: Record<string, string> = [
  "#60A5FA", "#C084FC", "#4ADE80", "#F59E0B",
  "#EC4899", "#14B8A6", "#F97316", "#A78BFA",
].reduce((acc, c, i) => ({ ...acc, [i]: c }), {} as Record<string, string>);

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  subtitle?: string;
}) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <div
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function ActivityDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch("/api/activities/stats"),
          fetch("/api/activities?limit=20"),
        ]);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecent(recentData.activities || []);
        }
      } catch (err) {
        console.error("Failed to load activity data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
            <Activity className="w-5 h-5 animate-pulse" />
            <span>{t("activity_dashboard.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  const byStatus = stats?.byStatus || {};
  const byType = stats?.byType || {};
  const trend = stats?.trend || [];
  const hourly = stats?.hourly || [];
  const totalStatus =
    Object.values(byStatus).reduce((a: number, b: number) => a + b, 0) || 0;
  const successCount = byStatus["success"] || 0;
  const successRate = totalStatus > 0 ? ((successCount / totalStatus) * 100).toFixed(1) : "0.0";

  const maxTrendCount = Math.max(...trend.map((t) => t.count), 1);
  const maxHourlyCount = Math.max(...hourly.map((h) => h.count), 1);

  const typeEntries = Object.entries(byType);
  const totalTypeCount = typeEntries.reduce((a, [, c]) => a + (c as number), 0) || 1;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2 flex items-center gap-3"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          <Activity className="w-7 h-7" style={{ color: "var(--accent)" }} />
          {t("activity_dashboard.title")}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {t("activity_dashboard.subtitle")}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label={t("activity_dashboard.total")}
          value={stats?.total ?? 0}
          icon={BarChart3}
          color="#60A5FA"
        />
        <SummaryCard
          label={t("activity_dashboard.today")}
          value={stats?.today ?? 0}
          icon={TrendingUp}
          color="#4ADE80"
        />
        <SummaryCard
          label={t("activity_dashboard.success_rate")}
          value={`${successRate}%`}
          icon={CheckCircle}
          color="#22c55e"
          subtitle={`${successCount} / ${totalStatus} `}
        />
        <SummaryCard
          label={t("activity_dashboard.by_status")}
          value={totalStatus}
          icon={PieChart}
          color="#C084FC"
        />
      </div>

      {/* Status breakdown mini-bars */}
      {Object.keys(byStatus).length > 0 && (
        <div
          className="rounded-xl p-4 mb-8"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex gap-3">
            {Object.entries(byStatus).map(([status, count]) => {
              const pct = totalStatus > 0 ? ((count as number) / totalStatus) * 100 : 0;
              return (
                <div key={status} className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[status] || "#888" }}
                    />
                    <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                      {status}
                    </span>
                    <span className="text-xs font-medium ml-auto" style={{ color: "var(--text-primary)" }}>
                      {count as number}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: "var(--border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[status] || "#888",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 7-day trend */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: "var(--accent)" }} />
            {t("activity_dashboard.trend")}
          </h3>
          {trend.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
              {t("activity_dashboard.no_data")}
            </p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {trend.map((d) => {
                const heightPct = (d.count / maxTrendCount) * 100;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "100%", justifyContent: "flex-end" }}>
                      {/* Error segment */}
                      {d.errors > 0 && (
                        <div
                          className="w-full rounded-t-sm"
                          style={{
                            height: `${(d.errors / maxTrendCount) * 100}%`,
                            minHeight: d.errors > 0 ? "2px" : "0",
                            backgroundColor: "#ef4444",
                            opacity: 0.7,
                          }}
                        />
                      )}
                      {/* Success segment */}
                      {d.success > 0 && (
                        <div
                          className="w-full rounded-t-sm"
                          style={{
                            height: `${((d.count - d.errors) / maxTrendCount) * 100}%`,
                            minHeight: d.count > 0 ? "2px" : "0",
                            backgroundColor: "#22c55e",
                            opacity: 0.8,
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)", fontSize: "9px" }}
                    >
                      {format(new Date(d.day), "MM/dd")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hourly distribution */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <Clock className="w-4 h-4" style={{ color: "var(--accent)" }} />
            {t("activity_dashboard.hourly")}
          </h3>
          {hourly.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
              {t("activity_dashboard.no_data")}
            </p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {hourly.map((h) => {
                const heightPct = (h.count / maxHourlyCount) * 100;
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${heightPct}%`,
                        minHeight: h.count > 0 ? "3px" : "0",
                        backgroundColor: "#60A5FA",
                        opacity: 0.6 + (heightPct / 100) * 0.4,
                        transition: "height 0.3s ease",
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)", fontSize: "8px" }}
                    >
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* By type + Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By type */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <PieChart className="w-4 h-4" style={{ color: "var(--accent)" }} />
            {t("activity_dashboard.by_type")}
          </h3>
          {typeEntries.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
              {t("activity_dashboard.no_data")}
            </p>
          ) : (
            <div className="space-y-2">
              {typeEntries.map(([type, count], idx) => {
                const pct = ((count as number) / totalTypeCount) * 100;
                const color = TYPE_COLORS[idx % Object.keys(TYPE_COLORS).length];
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                          {type}
                        </span>
                      </div>
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {count as number} ({(pct).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activities */}
        <div
          className="rounded-xl p-4 lg:col-span-2"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <List className="w-4 h-4" style={{ color: "var(--accent)" }} />
            {t("activity_dashboard.recent")}
          </h3>
          {recent.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
              {t("activity_dashboard.no_data")}
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recent.slice(0, 15).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 py-2.5"
                >
                  <div
                    className="mt-0.5 p-1 rounded"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${STATUS_COLORS[activity.status] || "#888"} 15%, transparent)`,
                    }}
                  >
                    {activity.status === "success" ? (
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: STATUS_COLORS[activity.status] || "#888" }} />
                    ) : activity.status === "error" ? (
                      <AlertCircle className="w-3.5 h-3.5" style={{ color: STATUS_COLORS[activity.status] || "#888" }} />
                    ) : (
                      <Clock className="w-3.5 h-3.5" style={{ color: STATUS_COLORS[activity.status] || "#888" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {activity.description}
                      </span>
                      {activity.agent && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
                            color: "var(--accent)",
                          }}
                        >
                          {activity.agent}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                        {activity.type}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {format(new Date(activity.timestamp), "MM/dd HH:mm")}
                      </span>
                      {activity.duration_ms !== null && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {activity.duration_ms}ms
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${STATUS_COLORS[activity.status] || "#888"} 15%, transparent)`,
                      color: STATUS_COLORS[activity.status] || "#888",
                    }}
                  >
                    {activity.status}
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
