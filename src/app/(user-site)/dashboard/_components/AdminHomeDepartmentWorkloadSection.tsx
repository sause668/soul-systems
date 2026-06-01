import Link from "next/link";

export type DepartmentWorkloadRow = {
  departmentId: number;
  name: string;
  activeOrQueued: number;
};

type Props = {
  workload: DepartmentWorkloadRow[];
};

export default function AdminHomeDepartmentWorkloadSection({ workload }: Props) {
  const max = Math.max(1, ...workload.map((w) => w.activeOrQueued));

  return (
    <section className="panel p-4">
      <div className="mb-3 text-sm font-semibold">Department workload heatmap</div>
      <div className="grid gap-2 md:grid-cols-4">
        {workload.map((w) => {
          const intensity = Math.round((w.activeOrQueued / max) * 100);
          return (
            <Link
              key={w.departmentId}
              href={`/departments?departmentId=${w.departmentId}`}
              className="block rounded-md border border-[var(--border)] p-3 text-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              aria-label={`Open ${w.name} department workflows`}
            >
              <div className="font-medium">{w.name}</div>
              <div className="mt-2 h-2 rounded-full bg-[var(--border)]">
                <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${intensity}%` }} />
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">{w.activeOrQueued} active/queued</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
