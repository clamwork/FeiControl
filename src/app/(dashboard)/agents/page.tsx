"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { Bot, Globe, RefreshCw, Send, X, ExternalLink, Wifi, WifiOff, Clock, Cpu } from "lucide-react";

interface AgentInfo {
  id: string;
  name?: string;
  emoji: string;
  color: string;
  model: string;
  workspace: string;
  role?: string;
  status: "online" | "offline";
  lastActivity?: string;
  activeSessions: number;
  allowAgentsDetails?: Array<{ id: string; name: string; emoji: string }>;
}

interface ClawTeamMember {
  id: string;
  name: string;
  emoji?: string;
  status: string;
  lastSeen?: string;
}

interface ClawTeamData {
  name: string;
  description: string;
  members: ClawTeamMember[];
  source: string;
}

export default function AgentsPage() {
  const { t } = useI18n();
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [remoteTeams, setRemoteTeams] = useState<ClawTeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"local" | "remote">("local");
  const [taskModal, setTaskModal] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState("");
  const [taskSending, setTaskSending] = useState(false);
  const [taskResult, setTaskResult] = useState<"success" | "error" | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [agentsRes, teamsRes] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/clawteam"),
      ]);
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.agents || []);
      }
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setRemoteTeams(data.teams || data.data || []);
      }
    } catch (e) {
      setError("Failed to fetch agent data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSendTask = async (agentId: string) => {
    if (!taskInput.trim()) return;
    setTaskSending(true);
    setTaskResult(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, description: taskInput.trim() }),
      });
      if (res.ok) {
        setTaskResult("success");
        setTaskInput("");
        setTimeout(() => { setTaskModal(null); setTaskResult(null); }, 1500);
      } else {
        setTaskResult("error");
      }
    } catch {
      setTaskResult("error");
    } finally {
      setTaskSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "var(--positive)";
      case "working": return "var(--warning)";
      default: return "var(--text-muted)";
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          <Bot className="inline-block w-6 h-6 mr-2" style={{ color: "var(--accent)" }} />
          {t("agents.title")}
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-opacity"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {t("agents.refresh")}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--negative)", border: "1px solid rgba(239,68,68,0.3)" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ backgroundColor: "var(--surface-elevated)" }}>
        <button
          onClick={() => setTab("local")}
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          style={{ backgroundColor: tab === "local" ? "var(--surface)" : "transparent", color: "var(--text-primary)" }}
        >
          {t("agents.local_title")} ({agents.length})
        </button>
        <button
          onClick={() => setTab("remote")}
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          style={{ backgroundColor: tab === "remote" ? "var(--surface)" : "transparent", color: "var(--text-primary)" }}
        >
          {t("agents.remote_title")} ({remoteTeams.length})
        </button>
      </div>

      {tab === "local" ? (
        agents.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t("agents.no_agents")}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-5 rounded-xl transition-shadow hover:shadow-lg"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                {/* Agent Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: agent.color + "20" }}
                  >
                    {agent.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {agent.name || agent.id}
                      </h3>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getStatusColor(agent.status) }}
                        />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {agent.status === "online" ? t("agents.status_online") : t("agents.status_offline")}
                        </span>
                      </div>
                    </div>
                    {agent.role && (
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {agent.role}
                      </p>
                    )}
                  </div>
                </div>

                {/* Agent Details */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{t("agents.model")}: {agent.model}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t("agents.last_activity")}: {agent.lastActivity ? new Date(agent.lastActivity).toLocaleString() : "N/A"}</span>
                  </div>
                </div>

                {/* Sub-agents */}
                {agent.allowAgentsDetails && agent.allowAgentsDetails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.allowAgentsDetails.map((sub) => (
                      <span
                        key={sub.id}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)" }}
                      >
                        {sub.emoji} {sub.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setTaskModal(agent.id)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "var(--accent)", color: "white" }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {t("agents.send_task")}
                  </button>
                  <button
                    className="py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t("agents.agent_detail")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        remoteTeams.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t("agents.no_teams")}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {remoteTeams.map((team) => (
              <div
                key={team.name}
                className="p-5 rounded-xl"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {team.name}
                </h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                  {team.description}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4" style={{ color: "var(--positive)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {team.source}
                  </span>
                </div>
                {team.members && team.members.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {team.members.map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)" }}
                      >
                        {m.emoji || "🤖"} {m.name}
                        {m.status === "online" ? <Wifi className="w-3 h-3" style={{ color: "var(--positive)" }} /> : <WifiOff className="w-3 h-3" style={{ color: "var(--text-muted)" }} />}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Send Task Modal */}
      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md p-6 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                <Send className="w-4 h-4 inline-block mr-2" />
                {t("agents.send_task")} — {agents.find(a => a.id === taskModal)?.name || taskModal}
              </h3>
              <button onClick={() => { setTaskModal(null); setTaskResult(null); }}>
                <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder={t("agents.task_placeholder")}
              className="w-full p-3 rounded-lg text-sm resize-none h-24 mb-3"
              style={{ backgroundColor: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSendTask(taskModal)}
                disabled={taskSending || !taskInput.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "white" }}
              >
                {taskSending ? "..." : t("agents.send_task")}
              </button>
              <button
                onClick={() => { setTaskModal(null); setTaskResult(null); }}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)" }}
              >
                {t("common.cancel")}
              </button>
            </div>
            {taskResult && (
              <p className="mt-2 text-sm" style={{ color: taskResult === "success" ? "var(--positive)" : "var(--negative)" }}>
                {taskResult === "success" ? t("agents.task_sent") : t("agents.task_failed")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
