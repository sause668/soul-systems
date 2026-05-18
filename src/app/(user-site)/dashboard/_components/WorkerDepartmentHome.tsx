import { computeWorkflowAlerts } from "@/lib/scheduling/alerts";
import { prisma } from "@/lib/prisma";
import {
  collectPartNumbersFromProcesses,
  fetchStockByPartNumber,
} from "@/lib/inventory/stock-for-processes";
import { getWorkerDepartments } from "@/lib/workers/worker-departments";
import { AlertsW } from "@/app/(user-site)/departments/_components/AlertsW";
import { LiveRefresh } from "@/app/(user-site)/departments/_components/LiveRefresh";
import { ProcessQueuesW } from "@/app/(user-site)/departments/_components/ProcessQueuesW";

type Props = { userId: number };

export async function WorkerDepartmentHome({ userId }: Props) {
  const { departmentIds, label: departmentLabel } = await getWorkerDepartments(userId);

  if (departmentIds.length === 0) {
    return (
      <PageShell departmentLabel={departmentLabel}>
        <p className="text-sm text-[var(--muted)]">
          Your account is not linked to a department. Contact an administrator to assign you before
          using the floor console.
        </p>
      </PageShell>
    );
  }

  const processes = await prisma.process.findMany({
    where: { departmentId: { in: departmentIds } },
    include: {
      department: true,
      job: { include: { blueprint: true } },
      processBlueprint: { include: { issueBlueprints: true } },
      issueJobs: true,
    },
    orderBy: [{ jobId: "asc" }, { order: "asc" }],
  });

  const partNumbers = collectPartNumbersFromProcesses(processes);
  const stockByPartNumber = await fetchStockByPartNumber(prisma, partNumbers);

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
  const scopedAlerts = alerts.filter(
    (a) => !a.departmentId || departmentIds.includes(a.departmentId),
  );

  const activeOrQueued = active.length + queued.length;

  return (
    <PageShell departmentLabel={departmentLabel}>
      <AlertsW alerts={scopedAlerts} />

      <section className="grid gap-4 lg:grid-cols-3">
        <SummaryCard title="Active in department" value={active.length} tone="ok" />
        <SummaryCard title="Queued in department" value={queued.length} tone="neutral" />
        <SummaryCard
          title="Overdue in department"
          value={overdue.length}
          tone={overdue.length ? "crit" : "ok"}
        />
      </section>

      <section className="panel p-4 text-sm">
        <div className="font-semibold">Department workload</div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {activeOrQueued} process step{activeOrQueued === 1 ? "" : "es"} active or queued in{" "}
          {departmentLabel}.
        </p>
      </section>

      <div id="queues" className="scroll-mt-24">
        <ProcessQueuesW
          active={active}
          queued={queued}
          overdue={overdue}
          isAdmin={false}
          userId={userId}
          stockByPartNumber={stockByPartNumber}
        />
      </div>
    </PageShell>
  );
}

function PageShell({
  departmentLabel,
  children,
}: {
  departmentLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <LiveRefresh />
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{departmentLabel}</p>
        <h1 className="text-3xl font-semibold">Department overview</h1>
        <p className="text-sm text-[var(--muted)]">
          Alerts, queues, and actions for your department only. Updates live via SSE.
        </p>
      </header>
      {children}
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
