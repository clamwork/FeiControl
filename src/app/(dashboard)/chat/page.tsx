"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";
import { MessageSquare, Send, Bot, User, Trash2, CornerDownLeft, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  agentId?: string;
}

interface AgentOption {
  id: string;
  name: string;
  emoji: string;
}

export default function ChatPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("main");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showAgents, setShowAgents] = useState(false);

  // Fetch agents on mount
  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        const list: AgentOption[] = (data.agents || []).map((a: any) => ({
          id: a.id,
          name: a.name || a.id,
          emoji: a.emoji || "🤖",
        }));
        setAgents(list);
      })
      .catch(() => {});
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      agentId: selectedAgent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedAgent, message: input.trim() }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: data.response || "[No response]",
        timestamp: new Date(),
        agentId: selectedAgent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "system",
        content: t("chat.error_send"),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  }, [input, sending, selectedAgent, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const selectedAgentInfo = agents.find((a) => a.id === selectedAgent);

  return (
    <div className="flex flex-col h-full max-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <h1 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("chat.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Agent Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAgents(!showAgents)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              {selectedAgentInfo?.emoji || "🤖"}
              <span>{selectedAgentInfo?.name || t("chat.agent_select")}</span>
            </button>
            {showAgents && (
              <div
                className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg overflow-hidden z-10"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => { setSelectedAgent(agent.id); setShowAgents(false); }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-opacity-80"
                    style={{
                      color: "var(--text-primary)",
                      backgroundColor: agent.id === selectedAgent ? "var(--surface-elevated)" : "transparent",
                    }}
                  >
                    <span>{agent.emoji}</span>
                    <span>{agent.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            title={t("chat.clear")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-12 h-12 mb-3" style={{ color: "var(--text-muted)", opacity: 0.3 }} />
            <p style={{ color: "var(--text-muted)" }}>{t("chat.no_messages")}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  backgroundColor: msg.role === "user" ? "var(--accent)" : "var(--surface-elevated)",
                }}
              >
                {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : msg.agentId ? agents.find(a => a.id === msg.agentId)?.emoji || "🤖" : <Bot className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] p-3 rounded-xl ${
                  msg.role === "user"
                    ? "rounded-tr-sm"
                    : msg.role === "system"
                    ? "rounded-xl"
                    : "rounded-tl-sm"
                }`}
                style={{
                  backgroundColor: msg.role === "user" ? "var(--accent)" : msg.role === "system" ? "rgba(239,68,68,0.1)" : "var(--surface-elevated)",
                  color: msg.role === "user" ? "white" : "var(--text-primary)",
                  border: msg.role === "system" ? "1px solid rgba(239,68,68,0.3)" : "none",
                }}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-1 opacity-60" style={{ textAlign: "right" }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--surface-elevated)" }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="p-3 rounded-xl rounded-tl-sm" style={{ backgroundColor: "var(--surface-elevated)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("chat.thinking")}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder")}
            rows={1}
            className="flex-1 p-3 rounded-xl text-sm resize-none"
            style={{
              backgroundColor: "var(--background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              maxHeight: "120px",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-3 rounded-xl transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs mt-1 text-center" style={{ color: "var(--text-muted)" }}>
          <CornerDownLeft className="w-3 h-3 inline-block mr-0.5" />
          Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  );
}
