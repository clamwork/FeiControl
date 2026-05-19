/**
 * Data export utility — CSV & JSON download
 */

/**
 * Convert an array of objects to CSV string
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: { key: string; label: string }[]
): string {
  if (data.length === 0) return "";

  const cols =
    columns ??
    Object.keys(data[0]).map((k) => ({ key: k, label: k }));

  const esc = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    // Escape quotes and wrap in quotes if contains comma / quote / newline
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = cols.map((c) => esc(c.label)).join(",");
  const rows = data.map((row) =>
    cols.map((c) => esc(row[c.key])).join(",")
  );

  return [header, ...rows].join("\r\n");
}

/**
 * Trigger a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download data as CSV
 */
export function downloadCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  const csv = toCSV(data, columns);
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

/**
 * Download data as JSON
 */
export function downloadJSON<T extends Record<string, unknown>>(
  data: T[],
  filename: string
) {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, "application/json;charset=utf-8;");
}

/**
 * Format date string for filenames: YYYY-MM-DD
 */
export function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
