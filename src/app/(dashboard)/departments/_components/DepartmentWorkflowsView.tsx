import { computeWorkflowAlerts } from "@/lib/scheduling/alerts";
import { prisma } from "@/lib/prisma";
import {
  collectPartNumbersFromProcesses,
  fetchStockByPartNumber,
} from "@/lib/inventory/stock-for-processes";
import { LiveRefresh } from "@/app/(dashboard)/worker/_components/LiveRefresh";
import { ProcessQueuesW } from "@/app/(dashboard)/worker/_components/ProcessQueuesW";
import { AlertsW } from "@/app/(dashboard)/worker/_components/AlertsW";
import { DepartmentSelector } from "@/app/(dashboard)/departments/_components/DepartmentSelector";

type Props = {
  userId: number;
  departments: { id: number; name: string }[];
  selectedDepartmentId: number;
};

export async function DepartmentWorkflowsView({ userId, departments, selectedDepartmentId }: Props) {
  const selected = departments.find((d) => d.id === selectedDepartmentId);
  const selectedName = selected?.name ?? "Department";

  const processes = await prisma.process.findMany({
    where: { departmentId: selectedDepartmentId },
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

  const partNumbers = collectPartNumbersFromProcesses(processes);
  const stockByPartNumber = await fetchStockByPartNumber(prisma, partNumbers);

  const active = processes.filter((p) => p.status === "ACTIVE");
  const queued = processes.filter((p) => p.status === "QUEUED");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = processes.filter(
    (p) => (p.status === "ACTIVE" || p.status === "QUEUED") && p.dueDate < today,
  );

  const alerts = await computeWorkflowAlerts(selectedDepartmentId);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <LiveRefresh />
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Admin · by department</p>
        <h1 className="text-3xl font-semibold">Department Workflows</h1>
        <p className="text-sm text-[var(--muted)]">
          Choose a department to inspect active and queued steps. Actions run as you; use{" "}
          <span className="font-medium text-[var(--foreground)]">Admin</span> for plant-wide tools.
        </p>
      </header>

      <section className="panel p-4">
        <div className="mb-3 text-sm font-semibold text-[var(--muted)]">Department</div>
        <DepartmentSelector departments={departments} selectedId={selectedDepartmentId} />
        <p className="mt-3 text-xs text-[var(--muted)]">
          Viewing: <span className="font-medium text-[var(--foreground)]">{selectedName}</span>
        </p>
      </section>

      <AlertsW alerts={alerts} />

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
          isAdmin
          userId={userId}
          stockByPartNumber={stockByPartNumber}
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
