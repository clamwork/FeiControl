"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          仪表盘出错了
        </h2>

        {/* Error Message */}
        <p
          className="text-sm mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {error.message || "发生了意外的错误，请重试。"}
        </p>

        {error.digest && (
          <p
            className="text-xs mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            错误 ID: {error.digest}
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
            重试
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
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
