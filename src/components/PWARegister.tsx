"use client";

import { useEffect } from "react";

/**
 * PWA Register — registers the service worker for offline support
 * and handles PWA install prompt (beforeinstallprompt).
 */
export function PWARegister() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.warn("[PWA] Service Worker registration failed:", error);
        });
    }

    // Listen for install prompt (for "Add to Home Screen")
    let deferredPrompt: Event | null = null;
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      // Could show a custom install button here
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Track if app is installed/displaying in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("[PWA] Running in standalone mode");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  return null; // This component doesn't render anything
}
