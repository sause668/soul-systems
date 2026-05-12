import { computeWorkflowAlerts } from "@/lib/scheduling/alerts";
import {
  getDepartmentWorkload,
  getJobStatusCounts,
  getThroughputSummary,
} from "@/lib/analytics/metrics";
import { prisma } from "@/lib/prisma";
import { AlertsW } from "@/app/(dashboard)/worker/_components/AlertsW";
import { CreateJobFormA } from "@/app/(dashboard)/admin/_components/CreateJobFormA";
import { LiveRefresh } from "@/app/(dashboard)/worker/_components/LiveRefresh";

export async function AdminHome() {
  const [alerts, throughput, statuses, workload, jobs] = await Promise.all([
    computeWorkflowAlerts(),
    getThroughputSummary(),
    getJobStatusCounts(),
    getDepartmentWorkload(),
    prisma.job.findMany({
      take: 15,
      orderBy: { id: "desc" },
      include: { blueprint: true, processes: { select: { id: true, status: true, departmentId: true } } },
    }),
  ]);

  const max = Math.max(1, ...workload.map((w) => w.activeOrQueued));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <LiveRefresh />
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Plant control</p>
        <h1 className="text-3xl font-semibold">Admin overview</h1>
        <p className="text-sm text-[var(--muted)]">
          Throughput, risk alerts, and workload heatmap update live via SSE.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric title="7d completions" value={throughput.processCompletions} hint="from audit trail" />
        <Metric title="7d inventory moves" value={throughput.inventoryIssues} hint="issued to jobs" />
        <Metric
          title="Jobs in flight"
          value={statuses.IN_PROGRESS ?? 0}
          hint={`completed: ${statuses.COMPLETED ?? 0}`}
        />
      </section>

      <AlertsW alerts={alerts} />

      <section className="panel p-4">
        <div className="mb-3 text-sm font-semibold">Department workload heatmap</div>
        <div className="grid gap-2 md:grid-cols-4">
          {workload.map((w) => {
            const intensity = Math.round((w.activeOrQueued / max) * 100);
            return (
              <div key={w.departmentId} className="rounded-md border border-[var(--border)] p-3 text-sm">
                <div className="font-medium">{w.name}</div>
                <div className="mt-2 h-2 rounded-full bg-[var(--border)]">
                  <div
                    className="h-2 rounded-full bg-[var(--accent)]"
                    style={{ width: `${intensity}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">{w.activeOrQueued} active/queued</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-4">
          <div className="mb-3 text-sm font-semibold">Recent jobs</div>
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Part</th>
                  <th className="pb-2">Units</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-[var(--border)]">
                    <td className="py-2 font-mono text-xs">{job.id}</td>
                    <td className="py-2">{job.blueprint.partNumber}</td>
                    <td className="py-2">{job.numOfUnits}</td>
                    <td className="py-2">
                      <span className="badge badge-neutral">{job.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div id="create-job" className="scroll-mt-24">
          <CreateJobFormA />
        </div>
      </section>
    </div>
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
