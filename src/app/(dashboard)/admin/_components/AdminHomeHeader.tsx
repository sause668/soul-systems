export default function AdminHomeHeader() {
  return (
    <header className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Plant control</p>
      <h1 className="text-3xl font-semibold">Admin overview</h1>
      <p className="text-sm text-[var(--muted)]">
        Throughput, risk alerts, and workload heatmap update live via SSE.
      </p>
    </header>
  );
}
