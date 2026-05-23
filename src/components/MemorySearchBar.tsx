"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, FileText, X, Loader2 } from "lucide-react";

interface SearchResult {
  file: string;
  title: string;
  snippet: string;
  matches: number;
  path: string;
}

interface MemorySearchBarProps {
  workspace?: string;
  onSelect?: (path: string) => void;
}

export function MemorySearchBar({ workspace, onSelect }: MemorySearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (workspace) params.set("workspace", workspace);
        const res = await fetch(`/api/memory/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setShowResults(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, workspace]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      setQuery("");
      setResults([]);
      setShowResults(false);
      onSelect?.(path);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) handleSelect(selected.path);
    } else if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative" style={{ minWidth: "200px", maxWidth: "360px" }}>
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2"
          size={14}
          style={{ color: "var(--text-muted)" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setShowResults(true); }}
          placeholder="Search files..."
          className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs focus:outline-none transition-colors"
          style={{
            backgroundColor: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-50 overflow-hidden"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {isSearching ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              No results found
            </div>
          ) : (
            results.map((result, i) => (
              <button
                key={`${result.path}-${i}`}
                className="w-full text-left px-3 py-2.5 transition-colors"
                style={{
                  backgroundColor: i === selectedIndex ? "var(--surface-elevated)" : "transparent",
                  borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => handleSelect(result.path)}
              >
                <div className="flex items-start gap-2.5">
                  <FileText size={14} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {result.title}
                      </span>
                      <span className="text-[10px] shrink-0 px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-muted)" }}>
                        {result.matches} match{result.matches !== 1 ? "es" : ""}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {result.snippet}
                    </p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                      {result.path}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
