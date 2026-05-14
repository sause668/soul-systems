import { prisma } from "@/lib/prisma";

export type JobArchiveRow = {
  jobId: number;
  partNumber: string;
  dueDate: Date;
  closingStatus: string;
};

/** Serializable copy for client components (dates as ISO strings). */
export type JobArchiveClientRow = Omit<JobArchiveRow, "dueDate"> & { dueDate: string };

export function jobArchivesToClientRows(rows: JobArchiveRow[]): JobArchiveClientRow[] {
  return rows.map((r) => ({
    ...r,
    dueDate: r.dueDate.toISOString(),
  }));
}

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Latest process completion time, or job `updatedAt` if none recorded. */
function completionAtForJob(job: {
  updatedAt: Date;
  processes: { completedAt: Date | null }[];
}): Date {
  const times = job.processes
    .map((p) => p.completedAt)
    .filter((d): d is Date => d != null)
    .map((d) => d.getTime());
  if (times.length === 0) return job.updatedAt;
  return new Date(Math.max(...times));
}

/**
 * Overdue: completed after the job due date (calendar UTC).
 * Near due: completed on time or early, but within 3 calendar days of the due date.
 */
function closingStatus(dueDate: Date, completedAt: Date): string {
  const due = startOfUtcDay(dueDate);
  const done = startOfUtcDay(completedAt);
  if (done > due) return "Completed overdue";
  const dayMs = 24 * 60 * 60 * 1000;
  const calendarDaysBeforeDue = Math.round((due - done) / dayMs);
  if (calendarDaysBeforeDue >= 0 && calendarDaysBeforeDue <= 3) return "Completed near due";
  return "—";
}

export async function getJobArchivesList(): Promise<JobArchiveRow[]> {
  const jobs = await prisma.job.findMany({
    where: { status: "COMPLETED" },
    orderBy: { id: "desc" },
    take: 400,
    include: {
      blueprint: { select: { partNumber: true } },
      processes: { select: { completedAt: true } },
    },
  });

  const rows = jobs.map((job) => {
    const completedAt = completionAtForJob(job);
    return {
      jobId: job.id,
      partNumber: job.blueprint.partNumber,
      dueDate: job.dueDate,
      closingStatus: closingStatus(job.dueDate, completedAt),
      _sort: completedAt.getTime(),
    };
  });

  rows.sort((a, b) => b._sort - a._sort);

  return rows.map(({ _sort, ...row }) => row);
}
