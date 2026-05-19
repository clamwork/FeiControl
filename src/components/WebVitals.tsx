"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface Metric {
  id: string;
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  delta?: number;
  navigationType?: string;
}

type MetricReport = {
  pathname: string;
  timestamp: string;
  metrics: Metric[];
};

/**
 * Web Vitals collector — reports Core Web Vitals to the API.
 * Uses PerformanceObserver API directly (framework-agnostic).
 */
export function WebVitals() {
  const pathname = usePathname();
  const reportedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Map metric names to their PerformanceEntry types
    const observers: PerformanceObserver[] = [];

    try {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const entry = entries[entries.length - 1];
          reportMetric({
            id: `lcp-${entry.startTime}`,
            name: "LCP",
            value: entry.startTime,
            rating: entry.startTime < 2500 ? "good" : entry.startTime < 4000 ? "needs-improvement" : "poor",
          });
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcpObserver);
    } catch { /* not supported */ }

    try {
      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entry = list.getEntries()[0] as any;
        if (entry) {
          const delay = entry.processingStart - entry.startTime;
          reportMetric({
            id: `fid-${entry.startTime}`,
            name: "FID",
            value: delay,
            rating: delay < 100 ? "good" : delay < 300 ? "needs-improvement" : "poor",
          });
        }
      });
      fidObserver.observe({ type: "first-input", buffered: true });
      observers.push(fidObserver);
    } catch { /* not supported */ }

    try {
      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      let clsEntries: any[] = [];
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }
        // Report whenever CLS changes
        reportMetric({
          id: `cls-final`,
          name: "CLS",
          value: clsValue,
          rating: clsValue < 0.1 ? "good" : clsValue < 0.25 ? "needs-improvement" : "poor",
        });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
      observers.push(clsObserver);
    } catch { /* not supported */ }

    // Report a metric
    const reportMetric = (metric: Metric) => {
      const dedupKey = `${metric.name}-${metric.id}`;
      if (reportedRef.current.has(dedupKey)) return;
      reportedRef.current.add(dedupKey);

      const body: MetricReport = {
        pathname,
        timestamp: new Date().toISOString(),
        metrics: [metric],
      };

      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/vitals", JSON.stringify(body));
      } else {
        fetch("/api/vitals", {
          method: "POST",
          body: JSON.stringify(body),
          keepalive: true,
        }).catch(() => { /* silent */ });
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
      }
    };

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [pathname]);

  return null; // No UI
}

/**
 * Display component for showing vitals in a debug panel.
 * Used internally — not exported by default.
 */
export function VitalsDisplay({ metrics }: { metrics: Metric[] }) {
  const ratingColor = (r?: string) => {
    if (r === "good") return "var(--positive)";
    if (r === "needs-improvement") return "var(--warning)";
    if (r === "poor") return "var(--negative)";
    return "var(--text-muted)";
  };

  const formatValue = (m: Metric) => {
    if (m.name === "CLS") return m.value.toFixed(3);
    return `${m.value.toFixed(0)} ms`;
  };

  return (
    <div style={{ display: "flex", gap: "12px", fontSize: "10px", fontFamily: "var(--font-mono)" }}>
      {metrics.map((m) => (
        <div key={m.id} className="flex items-center gap-1">
          <span style={{ color: "var(--text-muted)" }}>{m.name}:</span>
          <span style={{ color: ratingColor(m.rating), fontWeight: 600 }}>{formatValue(m)}</span>
        </div>
      ))}
    </div>
  );
}
