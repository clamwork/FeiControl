"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Map of shortcut keys to their display labels and actions.
 */
const SHORTCUTS: Record<string, { label: string; action: () => void }> = {};

// Registered on first import — we populate SHORTCUTS lazily
let registered = false;

type ShortcutDef = {
  key: string;
  label: string;
  action: string; // URL path
  ctrl?: boolean;
};

const DEFAULT_SHORTCUTS: ShortcutDef[] = [
  { key: "d", label: "Dashboard", action: "/" },
  { key: "a", label: "Activities", action: "/actions" },
  { key: "m", label: "Memory", action: "/memory" },
  { key: "f", label: "Files", action: "/files" },
  { key: "s", label: "Search", action: "/search" },
  { key: "c", label: "Calendar", action: "/calendar" },
  { key: "r", label: "Reports", action: "/reports" },
  { key: "g", label: "Git", action: "/git" },
  { key: "t", label: "Cron Tasks", action: "/cron" },
  { key: "o", label: "Costs", action: "/costs" },
  { key: "l", label: "Settings", action: "/settings" },
  { key: "n", label: "Notifications", action: "/notifications" },
  { key: "b", label: "About", action: "/about" },
  { key: "Escape", label: "Close", action: "__close__" },
];

type ShortcutHandler = {
  key: string;
  ctrl: boolean;
  handler: () => void;
  label: string;
};

/**
 * Global keyboard shortcuts provider.
 * Usage: wrap your app with <KeyboardShortcutsProvider> or mount <KeyboardShortcuts /> in layout.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const [showPalette, setShowPalette] = useState(false);
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const shortcutsRef = useRef<ShortcutHandler[]>([]);

  // Build shortcut handlers
  useEffect(() => {
    const handlers: ShortcutHandler[] = DEFAULT_SHORTCUTS.map((def) => ({
      key: def.key,
      ctrl: def.ctrl ?? true,
      label: def.label,
      handler: () => {
        if (def.action === "__close__") {
          setShowPalette(false);
        } else {
          router.push(def.action);
          setShowPalette(false);
        }
      },
    }));
    shortcutsRef.current = handlers;
  }, [router]);

  // Global keydown listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+K or Cmd+K — open command palette
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setShowPalette((prev) => !prev);
      return;
    }

    // When palette is open, route keypresses to filter
    if (showPalette) {
      if (e.key === "Escape") {
        setShowPalette(false);
        return;
      }
      if (e.key === "Enter" && filtered.length > 0) {
        filtered[0].handler();
        return;
      }
      return;
    }

    // Check shortcuts (Ctrl+key)
    for (const s of shortcutsRef.current) {
      if (s.ctrl && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === s.key.toLowerCase()) {
        e.preventDefault();
        s.handler();
        return;
      }
    }
  }, [showPalette, filter]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when palette opens
  useEffect(() => {
    if (showPalette && inputRef.current) {
      inputRef.current.focus();
      setFilter("");
    }
  }, [showPalette]);

  const filtered = shortcutsRef.current
    .filter((s) => !s.ctrl) // non-ctrl shortcuts appear in palette
    .concat(DEFAULT_SHORTCUTS.map((d) => ({
      key: d.key,
      ctrl: d.ctrl ?? true,
      label: d.label,
      handler: () => {
        if (d.action === "__close__") {
          setShowPalette(false);
        } else {
          router.push(d.action);
          setShowPalette(false);
        }
      },
    })))
    .filter((s) => s.label.toLowerCase().includes(filter.toLowerCase()));

  const uniqueFiltered = filtered.filter((s, i, arr) => arr.findIndex((x) => x.label === s.label) === i);

  return (
    <>
      {/* Command Palette */}
      {showPalette && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "15vh",
          }}
          onClick={() => setShowPalette(false)}
        >
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
          {/* Dialog */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "480px",
              maxWidth: "90vw",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Type a command or page name…"
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: "15px",
                fontFamily: "var(--font-body)",
                outline: "none",
              }}
            />
            {/* Results */}
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {uniqueFiltered.map((s, i) => {
                const isNavigate = s.ctrl;
                return (
                  <button
                    key={`${s.key}-${i}`}
                    onClick={() => s.handler()}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      background: "transparent",
                      border: "none",
                      borderBottom: i < uniqueFiltered.length - 1 ? "1px solid var(--border)" : "none",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontFamily: "var(--font-body)",
                      textAlign: "left",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-elevated)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span>{s.label}</span>
                    <kbd
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "var(--surface-elevated)",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {isNavigate ? `Ctrl+${s.key.toUpperCase()}` : (s.key === "Enter" ? "↵" : s.key)}
                    </kbd>
                  </button>
                );
              })}
              {uniqueFiltered.length === 0 && (
                <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No matching commands
                </div>
              )}
            </div>
            {/* Footer */}
            <div
              style={{
                padding: "8px 16px",
                borderTop: "1px solid var(--border)",
                fontSize: "11px",
                color: "var(--text-muted)",
                display: "flex",
                gap: "12px",
              }}
            >
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>Esc Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
