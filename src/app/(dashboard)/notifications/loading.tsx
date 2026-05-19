"use client";

import { useI18n } from "@/i18n";

export default function NotificationsLoading() {
  const { t } = useI18n();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "var(--text-muted)",
        fontSize: "14px",
      }}
    >
      {t("common.loading")}
    </div>
  );
}
