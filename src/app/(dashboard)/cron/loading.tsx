export default function Loading() {
  return (
    <div
      className="flex items-center justify-center min-h-[60vh]"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="text-center">
        <div
          className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-4"
          style={{
            borderColor: "var(--border)",
            borderTopColor: "var(--accent)",
          }}
        />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          加载中...
        </p>
      </div>
    </div>
  );
}
