import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit/audit-log";
import { soulEventBus } from "@/lib/sse/event-bus";

function publishAfter(jobId: number, departmentIds: number[]) {
  soulEventBus.publish({ type: "job:updated", jobId });
  soulEventBus.publish({ type: "process:updated", jobId });
  soulEventBus.publish({ type: "alerts:refresh" });
  for (const id of departmentIds) {
    soulEventBus.publish({ type: "department:updated", departmentId: id });
  }
}

export async function createJobFromBlueprint(input: {
  blueprintId: number;
  numOfUnits: number;
  dueDate: Date;
  actorUserId?: number | null;
}) {
  const result = await prisma.$transaction(async (tx) => {
    const blueprint = await tx.blueprint.findUnique({
      where: { id: input.blueprintId },
      include: { processBlueprints: { orderBy: { order: "asc" } } },
    });
    if (!blueprint) throw new Error("Blueprint not found");
    if (blueprint.processBlueprints.length === 0) {
      throw new Error("Blueprint has no process steps");
    }

    const job = await tx.job.create({
      data: {
        blueprintId: blueprint.id,
        numOfUnits: input.numOfUnits,
        dueDate: input.dueDate,
        status: "IN_PROGRESS",
      },
    });

    let isFirst = true;
    const deptIds = new Set<number>();
    for (const pb of blueprint.processBlueprints) {
      deptIds.add(pb.departmentId);
      await tx.process.create({
        data: {
          jobId: job.id,
          departmentId: pb.departmentId,
          processBlueprintId: pb.id,
          order: pb.order,
          dueDate: input.dueDate,
          status: isFirst ? "ACTIVE" : "QUEUED",
          startedAt: isFirst ? new Date() : null,
          estimatedMinutes: pb.timeEstimatePerUnit * input.numOfUnits,
        },
      });
      isFirst = false;
    }

    if (input.actorUserId != null) {
      await writeAudit(tx, {
        userId: input.actorUserId,
        action: "JOB_CREATE",
        entityType: "Job",
        entityId: String(job.id),
        metadata: { blueprintId: blueprint.id, numOfUnits: input.numOfUnits },
      });
    }

    return { job, departmentIds: [...deptIds] };
  });

  publishAfter(result.job.id, result.departmentIds);
  return result.job;
}

export async function completeProcess(input: {
  processId: number;
  userId: number;
  isAdmin: boolean;
}) {
  const result = await prisma.$transaction(async (tx) => {
    const proc = await tx.process.findUnique({
      where: { id: input.processId },
      include: { job: true },
    });
    if (!proc) throw new Error("Process not found");
    if (proc.status !== "ACTIVE") throw new Error("Process is not active");

    if (!input.isAdmin) {
      const worker = await tx.worker.findFirst({
        where: { userId: input.userId, departmentId: proc.departmentId },
      });
      if (!worker) throw new Error("Not authorized for this department");
    }

    const now = new Date();
    const actualMinutes =
      proc.startedAt != null
        ? Math.max(1, Math.round((now.getTime() - proc.startedAt.getTime()) / 60000))
        : null;

    await tx.process.update({
      where: { id: proc.id },
      data: {
        status: "COMPLETED",
        completedAt: now,
        actualMinutes,
      },
    });

    const next = await tx.process.findFirst({
      where: { jobId: proc.jobId, order: proc.order + 1 },
    });

    const deptIds = new Set<number>([proc.departmentId]);
    if (next) {
      deptIds.add(next.departmentId);
      await tx.process.update({
        where: { id: next.id },
        data: { status: "ACTIVE", startedAt: now },
      });
    } else {
      await tx.job.update({
        where: { id: proc.jobId },
        data: { status: "COMPLETED", updatedAt: now },
      });
    }

    await writeAudit(tx, {
      userId: input.userId,
      action: "PROCESS_COMPLETE",
      entityType: "Process",
      entityId: String(proc.id),
      metadata: { jobId: proc.jobId, nextProcessId: next?.id ?? null },
    });

    return { jobId: proc.jobId, nextProcessId: next?.id ?? null, departmentIds: [...deptIds] };
  });

  publishAfter(result.jobId, result.departmentIds);
  return result;
}

export async function recordMaterialIssue(input: {
  processId: number;
  userId: number;
  isAdmin: boolean;
  partNumber: string;
  quantityIssued: number;
}) {
  if (input.quantityIssued <= 0) throw new Error("Quantity must be positive");

  const meta = await prisma.process.findUnique({
    where: { id: input.processId },
    select: { id: true, departmentId: true, jobId: true },
  });
  if (!meta) throw new Error("Process not found");

  const departmentIds = await prisma.$transaction(async (tx) => {
    if (!input.isAdmin) {
      const worker = await tx.worker.findFirst({
        where: { userId: input.userId, departmentId: meta.departmentId },
      });
      if (!worker) throw new Error("Not authorized for this department");
    }

    const stock = await tx.stockPart.findUnique({ where: { partNumber: input.partNumber } });
    if (!stock) throw new Error("Unknown part number");
    if (stock.quantityStocked < input.quantityIssued) {
      throw new Error("Insufficient stock");
    }

    await tx.stockPart.update({
      where: { partNumber: input.partNumber },
      data: { quantityStocked: { decrement: input.quantityIssued } },
    });

    await tx.issueJob.create({
      data: {
        processId: input.processId,
        partNumber: input.partNumber,
        quantityIssued: input.quantityIssued,
      },
    });

    await writeAudit(tx, {
      userId: input.userId,
      action: "INVENTORY_ISSUE",
      entityType: "Process",
      entityId: String(input.processId),
      metadata: {
        partNumber: input.partNumber,
        quantityIssued: input.quantityIssued,
      },
    });

    return [meta.departmentId];
  });

  publishAfter(meta.jobId, departmentIds);

  return { ok: true as const };
}

export async function adminOverrideProcess(input: {
  processId: number;
  userId: number;
  status: "QUEUED" | "ACTIVE" | "COMPLETED" | "SKIPPED";
}) {
  const updated = await prisma.$transaction(async (tx) => {
    const proc = await tx.process.update({
      where: { id: input.processId },
      data: {
        status: input.status,
        startedAt: input.status === "ACTIVE" ? new Date() : null,
        completedAt: input.status === "COMPLETED" ? new Date() : null,
      },
      include: { job: true },
    });

    await writeAudit(tx, {
      userId: input.userId,
      action: "PROCESS_OVERRIDE",
      entityType: "Process",
      entityId: String(proc.id),
      metadata: { status: input.status },
    });

    return proc;
  });

  publishAfter(updated.jobId, [updated.departmentId]);
  return updated;
}
