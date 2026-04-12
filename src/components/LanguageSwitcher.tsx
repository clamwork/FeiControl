"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "en" as const, label: "English", flag: "🇺🇸" },
    { code: "zh" as const, label: "中文", flag: "🇨🇳" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 8px",
          borderRadius: "6px",
          backgroundColor: isOpen ? "var(--surface-elevated)" : "transparent",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        title={t("topbar.language")}
      >
        <Globe style={{ width: "16px", height: "16px", color: "var(--text-muted)" }} />
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          {currentLanguage?.flag}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: "140px",
            backgroundColor: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "8px 12px",
                backgroundColor: locale === lang.code ? "var(--accent-soft)" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (locale !== lang.code) {
                  e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (locale !== lang.code) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>{lang.flag}</span>
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: locale === lang.code ? 600 : 400,
                  color: locale === lang.code ? "var(--accent)" : "var(--text-primary)",
                }}
              >
                {lang.label}
              </span>
              {locale === lang.code && (
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--accent)",
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
