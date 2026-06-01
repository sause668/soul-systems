import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit/audit-log";

export type ProcessBlueprintInput = {
  id?: number;
  departmentId: number;
  order: number;
  processInstructions: string;
  timeEstimatePerUnit: number;
};

export async function createBlueprint(input: {
  customerId: number;
  partNumber: string;
  timeEstimatePerUnit: number;
  processes: ProcessBlueprintInput[];
  actorUserId: number;
}) {
  const partNumber = input.partNumber.trim();
  if (!partNumber) throw new Error("Part number is required");
  if (input.timeEstimatePerUnit < 0) throw new Error("Time estimate must be non-negative");
  if (input.processes.length === 0) throw new Error("At least one process step is required");

  return prisma.$transaction(async (tx) => {
    const existing = await tx.blueprint.findUnique({
      where: { customerId_partNumber: { customerId: input.customerId, partNumber } },
    });
    if (existing) throw new Error("A blueprint with this part number already exists for this customer");

    const bp = await tx.blueprint.create({
      data: {
        customerId: input.customerId,
        partNumber,
        timeEstimatePerUnit: input.timeEstimatePerUnit,
      },
    });

    for (const step of input.processes) {
      await tx.processBlueprint.create({
        data: {
          blueprintId: bp.id,
          departmentId: step.departmentId,
          order: step.order,
          processInstructions: step.processInstructions.trim() || "—",
          timeEstimatePerUnit: step.timeEstimatePerUnit,
        },
      });
    }

    await writeAudit(tx, {
      userId: input.actorUserId,
      action: "BLUEPRINT_CREATE",
      entityType: "Blueprint",
      entityId: String(bp.id),
      metadata: { partNumber, processCount: input.processes.length },
    });

    return bp;
  });
}

export async function updateBlueprint(input: {
  blueprintId: number;
  partNumber: string;
  timeEstimatePerUnit: number;
  processes: ProcessBlueprintInput[];
  actorUserId: number;
}) {
  const partNumber = input.partNumber.trim();
  if (!partNumber) throw new Error("Part number is required");
  if (input.timeEstimatePerUnit < 0) throw new Error("Time estimate must be non-negative");
  if (input.processes.length === 0) throw new Error("At least one process step is required");

  return prisma.$transaction(async (tx) => {
    const bp = await tx.blueprint.findUnique({
      where: { id: input.blueprintId },
      include: { _count: { select: { jobs: true } }, processBlueprints: true },
    });
    if (!bp) throw new Error("Blueprint not found");

    const duplicate = await tx.blueprint.findFirst({
      where: {
        customerId: bp.customerId,
        partNumber,
        NOT: { id: bp.id },
      },
    });
    if (duplicate) throw new Error("Another blueprint already uses this part number for this customer");

    await tx.blueprint.update({
      where: { id: bp.id },
      data: { partNumber, timeEstimatePerUnit: input.timeEstimatePerUnit },
    });

    const hasJobs = bp._count.jobs > 0;
    const existingIds = new Set(bp.processBlueprints.map((p) => p.id));

    if (hasJobs) {
      if (input.processes.length !== bp.processBlueprints.length) {
        throw new Error("Cannot add or remove process steps while jobs use this blueprint");
      }
      for (const step of input.processes) {
        if (step.id == null || !existingIds.has(step.id)) {
          throw new Error("Cannot add or remove process steps while jobs use this blueprint");
        }
        await tx.processBlueprint.update({
          where: { id: step.id },
          data: {
            departmentId: step.departmentId,
            order: step.order,
            processInstructions: step.processInstructions.trim() || "—",
            timeEstimatePerUnit: step.timeEstimatePerUnit,
          },
        });
      }
    } else {
      await tx.issueBlueprint.deleteMany({
        where: { processBlueprint: { blueprintId: bp.id } },
      });
      await tx.processBlueprint.deleteMany({ where: { blueprintId: bp.id } });
      for (const step of input.processes) {
        await tx.processBlueprint.create({
          data: {
            blueprintId: bp.id,
            departmentId: step.departmentId,
            order: step.order,
            processInstructions: step.processInstructions.trim() || "—",
            timeEstimatePerUnit: step.timeEstimatePerUnit,
          },
        });
      }
    }

    await writeAudit(tx, {
      userId: input.actorUserId,
      action: "BLUEPRINT_UPDATE",
      entityType: "Blueprint",
      entityId: String(bp.id),
      metadata: { partNumber, processCount: input.processes.length, hasJobs },
    });

    return bp;
  });
}

export async function deleteBlueprint(input: { blueprintId: number; actorUserId: number }) {
  return prisma.$transaction(async (tx) => {
    const bp = await tx.blueprint.findUnique({
      where: { id: input.blueprintId },
      include: { _count: { select: { jobs: true } } },
    });
    if (!bp) throw new Error("Blueprint not found");
    if (bp._count.jobs > 0) {
      throw new Error("Cannot delete a blueprint that has jobs. Complete or remove those jobs first.");
    }

    await writeAudit(tx, {
      userId: input.actorUserId,
      action: "BLUEPRINT_DELETE",
      entityType: "Blueprint",
      entityId: String(bp.id),
      metadata: { partNumber: bp.partNumber },
    });

    await tx.blueprint.delete({ where: { id: bp.id } });
  });
}
