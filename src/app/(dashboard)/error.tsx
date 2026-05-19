"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center p-8"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            <AlertTriangle className="w-8 h-8" style={{ color: "#ef4444" }} />
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          {t("error.dashboard_title")}
        </h2>

        {/* Error Message */}
        <p
          className="text-sm mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {error.message || t("error.generic_message")}
        </p>

        {error.digest && (
          <p
            className="text-xs mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            {t("error.error_id")}: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            {t("error.retry")}
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("error.go_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
