import { prisma } from "@/lib/prisma";
import type { WorkflowAlert } from "@/app/lib/definitions";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Heuristic alerts for departments and jobs (computed, not persisted). */
export async function computeWorkflowAlerts(
  departmentId?: number,
): Promise<WorkflowAlert[]> {
  const alerts: WorkflowAlert[] = [];
  const today = startOfToday();

  const warnWait = envInt("ALERT_QUEUE_WAIT_WARNING_MINUTES", 120);
  const critWait = envInt("ALERT_QUEUE_WAIT_CRITICAL_MINUTES", 240);
  const warnDepth = envInt("ALERT_QUEUE_DEPTH_WARNING", 5);
  const critDepth = envInt("ALERT_QUEUE_DEPTH_CRITICAL", 10);

  const departments = await prisma.department.findMany({
    where: departmentId ? { id: departmentId } : undefined,
    select: { id: true, name: true },
  });

  for (const dept of departments) {
    const queued = await prisma.process.findMany({
      where: { departmentId: dept.id, status: "QUEUED" },
      include: { job: true },
      orderBy: { id: "asc" },
    });

    if (queued.length >= critDepth) {
      alerts.push({
        id: `depth-crit-${dept.id}`,
        severity: "CRITICAL",
        code: "QUEUE_DEPTH",
        message: `${queued.length} jobs queued in ${dept.name} (threshold ${critDepth}).`,
        departmentId: dept.id,
        departmentName: dept.name,
      });
    } else if (queued.length >= warnDepth) {
      alerts.push({
        id: `depth-warn-${dept.id}`,
        severity: "WARNING",
        code: "QUEUE_DEPTH",
        message: `${queued.length} jobs queued in ${dept.name} (threshold ${warnDepth}).`,
        departmentId: dept.id,
        departmentName: dept.name,
      });
    }

    const active = await prisma.process.findMany({
      where: { departmentId: dept.id, status: "ACTIVE" },
      include: { job: true },
    });

    for (const proc of active) {
      if (proc.dueDate < today) {
        alerts.push({
          id: `overdue-${proc.id}`,
          severity: "CRITICAL",
          code: "PROCESS_OVERDUE",
          message: `Active process in ${dept.name} is past due (job #${proc.jobId}).`,
          departmentId: dept.id,
          departmentName: dept.name,
          jobId: proc.jobId,
          processId: proc.id,
        });
      }

      if (proc.startedAt) {
        const waitedMin = Math.round((Date.now() - proc.startedAt.getTime()) / 60000);
        const expected = Math.max(1, proc.estimatedMinutes || proc.timeCompletionPerUnit || 1);
        if (waitedMin > expected * 2) {
          alerts.push({
            id: `long-run-${proc.id}`,
            severity: "WARNING",
            code: "PROCESS_SLOW",
            message: `Active process in ${dept.name} has run ${waitedMin}m vs ~${expected}m estimated.`,
            departmentId: dept.id,
            departmentName: dept.name,
            jobId: proc.jobId,
            processId: proc.id,
          });
        }
      }
    }

    const oldestQueued = queued[0];
    if (oldestQueued?.job?.createdAt) {
      const ageMin = Math.round((Date.now() - oldestQueued.job.createdAt.getTime()) / 60000);
      if (ageMin >= critWait) {
        alerts.push({
          id: `wait-crit-${dept.id}`,
          severity: "CRITICAL",
          code: "QUEUE_STALLED",
          message: `Oldest queued work in ${dept.name} has waited ~${ageMin} minutes.`,
          departmentId: dept.id,
          departmentName: dept.name,
        });
      } else if (ageMin >= warnWait) {
        alerts.push({
          id: `wait-warn-${dept.id}`,
          severity: "WARNING",
          code: "QUEUE_STALLED",
          message: `Oldest queued work in ${dept.name} has waited ~${ageMin} minutes.`,
          departmentId: dept.id,
          departmentName: dept.name,
        });
      }
    }
  }

  const riskyJobs = await prisma.job.findMany({
    where: { status: "IN_PROGRESS" },
    include: {
      processes: {
        where: { status: { in: ["ACTIVE", "QUEUED"] } },
        orderBy: { order: "asc" },
      },
      blueprint: { include: { processBlueprints: true } },
    },
    take: 50,
  });

  for (const job of riskyJobs) {
    const remaining = job.processes
      .filter((p) => p.status !== "COMPLETED")
      .reduce((sum, p) => sum + (p.estimatedMinutes || 0), 0);
    const msToDue = job.dueDate.getTime() - Date.now();
    const minutesToDue = msToDue / 60000;
    if (minutesToDue > 0 && minutesToDue < remaining) {
      alerts.push({
        id: `slip-${job.id}`,
        severity: minutesToDue < remaining * 0.5 ? "CRITICAL" : "WARNING",
        code: "JOB_AT_RISK",
        message: `Job #${job.id} has ~${remaining}m of remaining work but only ${Math.round(minutesToDue)}m before due date.`,
        jobId: job.id,
      });
    }
  }

  return alerts;
}
