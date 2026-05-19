"use client";

import { useEffect, useState, useCallback } from "react";
import { Download } from "lucide-react";

/**
 * PWA Install Button — shown when the browser supports install (beforeinstallprompt).
 * Also checks if already in standalone mode (already installed).
 */
export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (typeof window !== "undefined") {
      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      );
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setInstalling(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    (deferredPrompt as any).prompt();
    const result = await (deferredPrompt as any).userChoice;
    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setInstalling(false);
  }, [deferredPrompt]);

  // Don't show if already installed or no prompt available
  if (isStandalone || !deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      title="Install App"
      style={{
        background: "linear-gradient(135deg, var(--accent), #6366f1)",
        border: "none",
        color: "#fff",
        cursor: installing ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "1px",
        fontFamily: "var(--font-body)",
        opacity: installing ? 0.7 : 1,
      }}
    >
      <Download style={{ width: "10px", height: "10px" }} />
      INSTALL
    </button>
  );
}
