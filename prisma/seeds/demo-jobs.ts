import type { PrismaClient } from "../../src/app/generated/prisma/client/client";

async function instantiateJob(prisma: PrismaClient, blueprintId: number, units: number, due: Date) {
  await prisma.$transaction(async (tx) => {
    const job = await tx.job.create({
      data: {
        blueprintId,
        numOfUnits: units,
        dueDate: due,
        status: "IN_PROGRESS",
      },
    });

    const steps = await tx.processBlueprint.findMany({
      where: { blueprintId },
      orderBy: { order: "asc" },
    });

    let first = true;
    for (const pb of steps) {
      await tx.process.create({
        data: {
          jobId: job.id,
          departmentId: pb.departmentId,
          processBlueprintId: pb.id,
          order: pb.order,
          dueDate: due,
          status: first ? "ACTIVE" : "QUEUED",
          startedAt: first ? new Date() : null,
          estimatedMinutes: pb.timeEstimatePerUnit * units,
        },
      });
      first = false;
    }
  });
}

export async function seedDemoJobs(prisma: PrismaClient) {
  const fanBlade = await prisma.blueprint.findFirst({ where: { partNumber: "FAN-BLADE-001" } });
  const frame = await prisma.blueprint.findFirst({ where: { partNumber: "FRAME-20U" } });
  if (!fanBlade || !frame) return;

  const existing = await prisma.job.count();
  if (existing > 0) return;

  const due = new Date();
  due.setDate(due.getDate() + 45);

  // Both blueprints start in Laser so the seeded laser operator immediately has active work.
  await instantiateJob(prisma, fanBlade.id, 25, due);
  await instantiateJob(prisma, frame.id, 20, due);
}
