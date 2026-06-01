import { prisma } from "@/lib/prisma";

export async function getThroughputSummary() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completions = await prisma.auditLog.count({
    where: { action: "PROCESS_COMPLETE", createdAt: { gte: since } },
  });
  const issues = await prisma.auditLog.count({
    where: { action: "INVENTORY_ISSUE", createdAt: { gte: since } },
  });
  return { windowDays: 7, processCompletions: completions, inventoryIssues: issues };
}

export async function getJobStatusCounts() {
  const grouped = await prisma.job.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Record<
    string,
    number
  >;
}

export async function getDepartmentWorkload() {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          processes: { where: { status: { in: ["ACTIVE", "QUEUED"] } } },
        },
      },
    },
  });
  return departments.map((d) => ({
    departmentId: d.id,
    name: d.name,
    activeOrQueued: d._count.processes,
  }));
}
