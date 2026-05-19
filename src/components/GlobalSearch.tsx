"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Search, FileText, Zap, Calendar, X, GitBranch,
  Clock, Bell, ChevronRight,
} from "lucide-react";
import { useI18n } from "@/i18n";

type SearchResultType = "memory" | "activity" | "task" | "file" | "notification" | "git" | "cron";

interface SearchResult {
  type: SearchResultType;
  title: string;
  snippet: string;
  path?: string;
  timestamp?: string;
}

const typeConfig: Record<
  SearchResultType,
  { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; bg: string }
> = {
  memory: { icon: FileText, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)" },
  activity: { icon: Zap, color: "var(--accent)", bg: "rgba(255, 59, 48, 0.12)" },
  task: { icon: Calendar, color: "#A855F7", bg: "rgba(168, 85, 247, 0.12)" },
  file: { icon: FileText, color: "#34C759", bg: "rgba(52, 199, 89, 0.12)" },
  notification: { icon: Bell, color: "#FF9F0A", bg: "rgba(255, 159, 10, 0.12)" },
  git: { icon: GitBranch, color: "#5E5CE6", bg: "rgba(94, 92, 230, 0.12)" },
  cron: { icon: Clock, color: "#FF6482", bg: "rgba(255, 100, 130, 0.12)" },
};

interface GlobalSearchProps {
  fullPage?: boolean;
}

/** Highlight matching characters in text */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) {
    return <>{text}</>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: { type: "match" | "normal"; text: string }[] = [];
  let textIdx = 0;
  let queryIdx = 0;

  while (textIdx < text.length && queryIdx < lowerQuery.length) {
    const charPos = lowerText.indexOf(lowerQuery[queryIdx], textIdx);
    if (charPos === -1) break;

    if (charPos > textIdx) {
      parts.push({ type: "normal", text: text.slice(textIdx, charPos) });
    }

    parts.push({ type: "match", text: text[charPos] });
    textIdx = charPos + 1;
    queryIdx++;
  }

  if (textIdx < text.length) {
    parts.push({ type: "normal", text: text.slice(textIdx) });
  }

  return (
    <>
      {parts.map((part, i) =>
        part.type === "match" ? (
          <mark key={i} style={{ backgroundColor: "rgba(255, 159, 10, 0.35)", borderRadius: "2px", padding: "0 1px" }}>
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

export function GlobalSearch({ fullPage = false }: GlobalSearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typeFilter, setTypeFilter] = useState<SearchResultType | "all">("all");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredResults = useMemo(() => {
    if (typeFilter === "all") return results;
    return results.filter((r) => r.type === typeFilter);
  }, [results, typeFilter]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredResults.length]);

  const searchDebounced = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const typeParam = typeFilter !== "all" ? `&type=${typeFilter}` : "";
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}${typeParam}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      }
      setIsSearching(false);
    },
    [typeFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => searchDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchDebounced]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const selected = filteredResults[selectedIndex];
        if (selected) {
          // Navigate based on type
          const pathMap: Partial<Record<SearchResultType, string>> = {
            memory: "/memory",
            activity: "/actions",
            task: "/cron",
            file: "/files",
            notification: "/notifications",
            git: "/git",
            cron: "/cron",
          };
          const route = pathMap[selected.type] || "/search";
          window.location.href = route;
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setQuery("");
        setResults([]);
        inputRef.current?.blur();
      }
    },
    [filteredResults, selectedIndex]
  );

  const typeFilters: { value: SearchResultType | "all"; label: string }[] = [
    { value: "all", label: t("global_search.filter_all") },
    { value: "memory", label: t("global_search.filter_memory") },
    { value: "activity", label: t("global_search.filter_activity") },
    { value: "task", label: t("global_search.filter_task") },
    { value: "file", label: t("global_search.filter_file") },
    { value: "notification", label: t("global_search.filter_notification") },
    { value: "git", label: t("global_search.filter_git") },
    { value: "cron", label: t("global_search.filter_cron") },
  ];

  return (
    <div className={fullPage ? "" : "relative"}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: "var(--text-secondary)" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("global_search.placeholder")}
          className="w-full pl-12 pr-10 py-3 rounded-xl transition-colors focus:outline-none"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          autoFocus={fullPage}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Type Filters */}
      {fullPage && query.length >= 2 && (
        <div className="flex flex-wrap gap-1.5 mt-3" style={{}}>
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setTypeFilter(f.value);
                setSelectedIndex(-1);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  typeFilter === f.value ? "var(--accent)" : "var(--card)",
                color:
                  typeFilter === f.value ? "#fff" : "var(--text-secondary)",
                border:
                  typeFilter === f.value
                    ? "1px solid transparent"
                    : "1px solid var(--border)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Keyboard hint */}
      {fullPage && filteredResults.length > 0 && (
        <div className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          {t("global_search.keyboard_hint")}
        </div>
      )}

      {/* Results */}
      {(query.length >= 2 || results.length > 0) && (
        <div
          ref={resultsRef}
          className={`${
            fullPage
              ? "mt-4 rounded-xl"
              : "absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
          }`}
          style={{ backgroundColor: "var(--card)" }}
        >
          {isSearching && (
            <div className="p-4 text-center" style={{ color: "var(--text-secondary)" }}>
              {t("global_search.searching")}
            </div>
          )}

          {!isSearching && filteredResults.length === 0 && query.length >= 2 && (
            <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>
                {t("global_search.no_results_for")} &quot;{query}&quot;
              </p>
            </div>
          )}

          {!isSearching && filteredResults.length > 0 && (
            <div>
              {filteredResults.map((result, index) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={`${result.type}-${result.title}-${index}`}
                    className="p-4 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--surface-elevated)"
                        : "transparent",
                      borderBottom:
                        index < filteredResults.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      const pathMap: Partial<Record<SearchResultType, string>> = {
                        memory: "/memory",
                        activity: "/actions",
                        task: "/cron",
                        file: "/files",
                        notification: "/notifications",
                        git: "/git",
                        cron: "/cron",
                      };
                      const route = pathMap[result.type] || "/search";
                      window.location.href = route;
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-medium truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            <HighlightedText text={result.title} query={query} />
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: config.bg, color: config.color }}
                          >
                            {t(`global_search.type_${result.type}` as any)}
                          </span>
                        </div>
                        <p
                          className="text-sm line-clamp-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <HighlightedText text={result.snippet} query={query} />
                        </p>
                        {result.path && (
                          <p
                            className="text-xs mt-1 truncate"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {result.path}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 mt-2"
                        style={{
                          color: "var(--text-muted)",
                          opacity: isSelected ? 1 : 0,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
