"use client";

import { useState } from "react";
import {
  RefreshCw,
  Trash2,
  FileText,
  Key,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { useI18n } from "@/i18n";

interface QuickActionsProps {
  onActionComplete?: () => void;
}

interface ActionButton {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "blue" | "yellow" | "red";
  action: () => Promise<void> | void;
  placeholder?: boolean;
}

export function QuickActions({ onActionComplete }: QuickActionsProps) {
  const { t } = useI18n();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRestartGateway = async () => {
    // Placeholder - would call openclaw gateway restart
    showNotification("success", t("settings.quick_actions.gateway_restart_sent"));
  };

  const handleClearActivityLog = async () => {
    setLoadingAction("clear_log");
    try {
      const res = await fetch("/api/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_activity_log" }),
      });

      if (!res.ok) throw new Error("Failed to clear logs");

      showNotification("success", t("settings.quick_actions.activity_logs_cleared"));
      onActionComplete?.();
    } catch {
      showNotification("error", t("settings.quick_actions.failed_clear_logs"));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewLogs = async () => {
    // Placeholder - would open gateway logs
    showNotification("success", t("settings.quick_actions.opening_logs"));
  };

  const actions: ActionButton[] = [
    {
      id: "restart",
      label: t("settings.quick_actions.restart_gateway"),
      icon: RefreshCw,
      color: "blue",
      action: handleRestartGateway,
      placeholder: true,
    },
    {
      id: "clear_log",
      label: t("settings.quick_actions.clear_activity_logs"),
      icon: Trash2,
      color: "yellow",
      action: handleClearActivityLog,
    },
    {
      id: "view_logs",
      label: t("settings.quick_actions.view_gateway_logs"),
      icon: FileText,
      color: "emerald",
      action: handleViewLogs,
      placeholder: true,
    },
    {
      id: "change_password",
      label: t("settings.quick_actions.change_password"),
      icon: Key,
      color: "red",
      action: () => setShowPasswordModal(true),
    },
  ];

  const colorClasses = {
    emerald:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20",
    yellow:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20",
  };

  return (
    <>
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-400" />
          {t("settings.quick_actions.title")}
        </h2>

        {/* Notification */}
        {notification && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
              notification.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const isLoading = loadingAction === action.id;

            return (
              <button
                key={action.id}
                onClick={() => action.action()}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  colorClasses[action.color]
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="font-medium">{action.label}</span>
                {action.placeholder && (
                  <span className="text-xs opacity-50">({t("settings.quick_actions.placeholder")})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          showNotification("success", t("settings.quick_actions.password_changed"));
          setShowPasswordModal(false);
        }}
      />
    </>
  );
}
