type Throughput = {
  windowDays: number;
  processCompletions: number;
  inventoryIssues: number;
};

type Props = {
  throughput: Throughput;
  statuses: Record<string, number>;
};

export default function AdminHomeMetricsSection({ throughput, statuses }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Metric title="7d completions" value={throughput.processCompletions} hint="from audit trail" />
      <Metric title="7d inventory moves" value={throughput.inventoryIssues} hint="issued to jobs" />
      <Metric
        title="Jobs in flight"
        value={statuses.IN_PROGRESS ?? 0}
        hint={`completed: ${statuses.COMPLETED ?? 0}`}
      />
    </section>
  );
}

function Metric({ title, value, hint }: { title: string; value: number; hint: string }) {
  return (
    <div className="panel p-4">
      <div className="text-xs uppercase text-[var(--muted)]">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div>
    </div>
  );
}
