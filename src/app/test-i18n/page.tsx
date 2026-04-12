"use client";

import { useI18n } from "@/i18n";

export default function TestI18nPage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        i18n Test Page
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <p>Current Locale: <strong>{locale}</strong></p>
        <button
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Switch to {locale === "zh" ? "English" : "中文"}
        </button>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <div>
          <strong>Topbar Search:</strong> {t("topbar.search_placeholder")}
        </div>
        <div>
          <strong>Version:</strong> {t("topbar.version")}1.0
        </div>
        <div>
          <strong>Dock Home:</strong> {t("dock.home")}
        </div>
        <div>
          <strong>Dock Calendar:</strong> {t("dock.calendar")}
        </div>
        <div>
          <strong>Common Save:</strong> {t("common.save")}
        </div>
        <div>
          <strong>Common Cancel:</strong> {t("common.cancel")}
        </div>
      </div>
    </div>
  );
}
