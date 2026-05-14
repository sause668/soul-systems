import type { JobStatus, ProcessStatus } from "@/app/generated/prisma/client/enums";
import { prisma } from "@/lib/prisma";

export type JobDetailsRow = {
  jobId: number;
  partNumber: string;
  numOfUnits: number;
  dueDate: Date;
  departmentName: string;
  statusLabel: string;
  jobStatus: JobStatus;
};

/** Serializable copy for client components (dates as ISO strings). */
export type JobDetailsClientRow = Omit<JobDetailsRow, "dueDate"> & { dueDate: string };

export function jobDetailsToClientRows(rows: JobDetailsRow[]): JobDetailsClientRow[] {
  return rows.map((r) => ({
    ...r,
    dueDate: r.dueDate.toISOString(),
  }));
}

type ProcessWithDept = {
  id: number;
  order: number;
  status: ProcessStatus;
  startedAt: Date | null;
  department: { name: string };
};

type JobWithRelations = {
  id: number;
  status: JobStatus;
  numOfUnits: number;
  dueDate: Date;
  blueprint: { partNumber: string };
  processes: ProcessWithDept[];
};

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function pickCurrentProcess(processes: ProcessWithDept[]): ProcessWithDept | null {
  if (processes.length === 0) return null;
  const active = processes.find((p) => p.status === "ACTIVE");
  if (active) return active;
  const queued = processes.find((p) => p.status === "QUEUED");
  if (queued) return queued;
  const pending = processes.find((p) => p.status !== "COMPLETED" && p.status !== "SKIPPED");
  if (pending) return pending;
  return processes[processes.length - 1] ?? null;
}

function buildStatusLabel(job: JobWithRelations, current: ProcessWithDept | null): string {
  if (job.status === "ON_HOLD") return "On hold (job)";
  if (job.status === "DRAFT") return "Draft";
  if (!current) return job.status;
  if (current.status === "ACTIVE") return `Active — ${current.department.name}`;
  if (current.status === "QUEUED") return `Queued — ${current.department.name}`;
  if (current.status === "COMPLETED") return `Completed step — ${current.department.name}`;
  if (current.status === "SKIPPED") return `Skipped — ${current.department.name}`;
  return `${current.status} — ${current.department.name}`;
}

function stallMs(current: ProcessWithDept | null): number {
  if (!current || current.status !== "ACTIVE" || !current.startedAt) return 0;
  return Date.now() - current.startedAt.getTime();
}

function toRow(job: JobWithRelations, current: ProcessWithDept | null): JobDetailsRow {
  const departmentName = current?.department.name ?? "—";
  return {
    jobId: job.id,
    partNumber: job.blueprint.partNumber,
    numOfUnits: job.numOfUnits,
    dueDate: job.dueDate,
    departmentName,
    statusLabel: buildStatusLabel(job, current),
    jobStatus: job.status,
  };
}

function comparePriority(a: JobDetailsRow & { overdue: boolean; stallMs: number }, b: typeof a): number {
  if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
  const dueA = a.dueDate.getTime();
  const dueB = b.dueDate.getTime();
  if (dueA !== dueB) return dueA - dueB;
  const holdA = a.jobStatus === "ON_HOLD" ? 1 : 0;
  const holdB = b.jobStatus === "ON_HOLD" ? 1 : 0;
  if (holdA !== holdB) return holdA - holdB;
  return b.stallMs - a.stallMs;
}

export async function getJobDetailsList(): Promise<JobDetailsRow[]> {
  const jobs = await prisma.job.findMany({
    where: { status: { not: "COMPLETED" } },
    orderBy: { id: "asc" },
    include: {
      blueprint: { select: { partNumber: true } },
      processes: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          status: true,
          startedAt: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  const today = startOfUtcDay(new Date());

  const enriched = jobs.map((job) => {
    const current = pickCurrentProcess(job.processes);
    const due = startOfUtcDay(job.dueDate);
    const overdue = due < today;
    const stall = stallMs(current);
    return { ...toRow(job, current), overdue, stallMs: stall };
  });

  enriched.sort(comparePriority);

  return enriched.map(({ overdue: _o, stallMs: _s, ...row }) => row);
}
