import { NextRequest, NextResponse } from "next/server";

interface Metric {
  id: string;
  name: string;
  value: number;
  rating?: string;
  delta?: number;
  navigationType?: string;
}

interface VitalsReport {
  pathname: string;
  timestamp: string;
  metrics: Metric[];
}

/**
 * POST /api/vitals — receive Web Vitals reports from the client.
 * Stores them in memory (rotating buffer). In production, you might
 * send these to an external analytics service or persistent store.
 */
const MAX_REPORTS = 200;
const reports: VitalsReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: VitalsReport = await request.json();

    // Validate basic structure
    if (!body.metrics || !Array.isArray(body.metrics) || body.metrics.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Add to ring buffer
    reports.push({
      pathname: body.pathname,
      timestamp: body.timestamp || new Date().toISOString(),
      metrics: body.metrics,
    });

    // Trim old entries
    while (reports.length > MAX_REPORTS) {
      reports.shift();
    }

    return NextResponse.json({ ok: true, stored: body.metrics.length });
  } catch (error) {
    console.error("[vitals] Failed to process report:", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

/**
 * GET /api/vitals — retrieve stored vitals (for dashboard display).
 */
export async function GET() {
  // Summarize latest values per metric type
  const latest: Record<string, number[]> = {};

  for (const report of reports) {
    for (const metric of report.metrics) {
      if (!latest[metric.name]) latest[metric.name] = [];
      latest[metric.name].push(metric.value);
    }
  }

  const summary = Object.entries(latest).map(([name, values]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    return {
      name,
      count: values.length,
      avg: Math.round(avg * 100) / 100,
      min: Math.round(sorted[0] * 100) / 100,
      max: Math.round(sorted[sorted.length - 1] * 100) / 100,
      p50: Math.round(sorted[Math.floor(sorted.length * 0.5)] * 100) / 100,
      p95: Math.round(sorted[Math.floor(sorted.length * 0.95)] * 100) / 100,
    };
  });

  return NextResponse.json({
    totalReports: reports.length,
    summary,
  });
}
