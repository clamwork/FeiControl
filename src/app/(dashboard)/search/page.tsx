"use client";

import { GlobalSearch } from "@/components/GlobalSearch";
import { useI18n } from "@/i18n";

export default function SearchPage() {
  const { t } = useI18n();

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold mb-1 md:mb-2"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
        >
          {t("global_search.pages")}
        </h1>
        <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
          {t("global_search.placeholder")}
        </p>
      </div>

      <GlobalSearch fullPage />
    </div>
  );
}
