"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, Trash2, ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  type: "file" | "agent" | "page";
  label: string;
  path: string;
  emoji: string;
  createdAt: string;
}

const STORAGE_KEY = "feicontrol_favorites";

export default function FavoritesPage() {
  const { t } = useI18n();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  const loadBookmarks = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch {
      setBookmarks([]);
    }
  }, []);

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Listen for storage changes (cross-tab)
  useEffect(() => {
    const handler = () => loadBookmarks();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [loadBookmarks]);

  const typeColors: Record<string, string> = {
    file: "#60A5FA",
    agent: "#C084FC",
    page: "#4ADE80",
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2 flex items-center gap-3"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          <Bookmark className="w-7 h-7" style={{ color: "var(--accent)" }} />
          {t("favorites.title")}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {t("favorites.subtitle")}
        </p>
      </div>

      {/* Bookmark grid */}
      {bookmarks.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl"
          style={{
            backgroundColor: "var(--card)",
            border: "1px dashed var(--border)",
          }}
        >
          <Bookmark className="w-12 h-12 mb-4" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
          <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", maxWidth: "300px" }}>
            {t("favorites.empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="p-4 rounded-xl group relative"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = typeColors[bookmark.type] || "var(--border)";
                e.currentTarget.style.boxShadow = `0 0 0 1px ${typeColors[bookmark.type]}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Type badge */}
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `color-mix(in srgb, ${typeColors[bookmark.type]} 15%, transparent)`,
                  color: typeColors[bookmark.type],
                  marginBottom: "8px",
                  display: "inline-block",
                }}
              >
                {t("favorites.type_" + bookmark.type)}
              </span>

              {/* Delete button */}
              <button
                onClick={() => removeBookmark(bookmark.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                title={t("favorites.bookmark_removed")}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Emoji + Label */}
              <div className="flex items-center gap-3 mb-2 mt-1">
                <span style={{ fontSize: "28px", lineHeight: 1 }}>{bookmark.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {bookmark.label}
                  </p>
                </div>
              </div>

              {/* Path and link */}
              <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <span
                  className="text-xs truncate flex-1"
                  style={{ color: "var(--text-muted)", fontFamily: "monospace" }}
                >
                  {bookmark.path}
                </span>
                <Link
                  href={bookmark.path}
                  className="flex items-center gap-1 text-xs font-medium ml-2"
                  style={{ color: "var(--accent)" }}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
