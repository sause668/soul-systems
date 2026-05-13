import { computeWorkflowAlerts } from "@/lib/scheduling/alerts";
import { prisma } from "@/lib/prisma";
import { getWorkerDepartmentIds } from "@/app/_actions/manufacturing-actions";
import { LiveRefresh } from "@/app/(dashboard)/worker/_components/LiveRefresh";
import { ProcessQueuesW } from "@/app/(dashboard)/worker/_components/ProcessQueuesW";
import { AlertsW } from "@/app/(dashboard)/worker/_components/AlertsW";

type Props = { userId: number };

export async function WorkerDashboard({ userId }: Props) {
  const departmentIds = await getWorkerDepartmentIds(userId);

  const processes = await prisma.process.findMany({
    where: { departmentId: { in: departmentIds } },
    include: {
      department: true,
      job: { include: { blueprint: true } },
      processBlueprint: {
        include: { issueBlueprints: true },
      },
      issueJobs: true,
    },
    orderBy: [{ jobId: "asc" }, { order: "asc" }],
  });

  const active = processes.filter((p) => p.status === "ACTIVE");
  const queued = processes.filter((p) => p.status === "QUEUED");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = processes.filter(
    (p) => (p.status === "ACTIVE" || p.status === "QUEUED") && p.dueDate < today,
  );

  const alerts = await computeWorkflowAlerts(
    departmentIds.length === 1 ? departmentIds[0] : undefined,
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <LiveRefresh />
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Department operations</p>
        <h1 className="text-3xl font-semibold">Worker console</h1>
        <p className="text-sm text-[var(--muted)]">
          Showing queues for your assigned departments only.
        </p>
      </header>

      <AlertsW alerts={alerts.filter((a) => !a.departmentId || departmentIds.includes(a.departmentId))} />

      <section className="grid gap-4 lg:grid-cols-3">
        <SummaryCard title="Active" value={active.length} tone="ok" />
        <SummaryCard title="Queued" value={queued.length} tone="neutral" />
        <SummaryCard title="Overdue in view" value={overdue.length} tone={overdue.length ? "crit" : "ok"} />
      </section>

      <div id="queues" className="scroll-mt-24">
        <ProcessQueuesW
          active={active}
          queued={queued}
          overdue={overdue}
          isAdmin={false}
          userId={userId}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "ok" | "neutral" | "crit";
}) {
  const badge =
    tone === "ok" ? "badge-ok" : tone === "crit" && value > 0 ? "badge-crit" : "badge-neutral";
  return (
    <div className="panel flex flex-col gap-2 p-4">
      <div className="text-sm text-[var(--muted)]">{title}</div>
      <div className={`badge w-fit ${badge}`}>{value}</div>
    </div>
  );
}
