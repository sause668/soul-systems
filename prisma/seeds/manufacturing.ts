import type { PrismaClient } from "../../src/app/generated/prisma/client/client";

const DEPARTMENT_NAMES = [
  "Laser",
  "Machining",
  "Grinding",
  "Forming",
  "Manual",
  "Paint",
  "Welding",
  "Assembly",
] as const;

type Step = {
  dept: (typeof DEPARTMENT_NAMES)[number];
  order: number;
  mins: number;
  instructions: string;
  issues?: { part: string; qty: number }[];
};

async function rebuildBlueprint(
  prisma: PrismaClient,
  deptByName: Map<string, number>,
  customerId: number,
  partNumber: string,
  timeEstimatePerUnit: number,
  steps: Step[],
) {
  const bp = await prisma.blueprint.upsert({
    where: { customerId_partNumber: { customerId, partNumber } },
    create: { customerId, partNumber, timeEstimatePerUnit },
    update: { timeEstimatePerUnit },
  });

  await prisma.issueBlueprint.deleteMany({
    where: { processBlueprint: { blueprintId: bp.id } },
  });
  await prisma.processBlueprint.deleteMany({ where: { blueprintId: bp.id } });

  for (const step of steps) {
    const departmentId = deptByName.get(step.dept);
    if (!departmentId) throw new Error(`Missing department ${step.dept}`);

    const pb = await prisma.processBlueprint.create({
      data: {
        blueprintId: bp.id,
        departmentId,
        order: step.order,
        processInstructions: step.instructions,
        timeEstimatePerUnit: step.mins,
        quantityCompleted: 0,
      },
    });

    if (step.issues) {
      for (const issue of step.issues) {
        await prisma.issueBlueprint.create({
          data: {
            processBlueprintId: pb.id,
            partNumber: issue.part,
            quantityNeeded: issue.qty,
          },
        });
      }
    }
  }
}

export async function seedManufacturing(prisma: PrismaClient) {
  for (const name of DEPARTMENT_NAMES) {
    await prisma.department.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  const departments = await prisma.department.findMany();
  const deptByName = new Map(departments.map((d) => [d.name, d.id]));

  const customer =
    (await prisma.customer.findFirst({ where: { name: "Soul Demo Manufacturing" } })) ??
    (await prisma.customer.create({ data: { name: "Soul Demo Manufacturing" } }));

  const sop = "Follow documented SOP, verify first-piece, and log exceptions.";

  await rebuildBlueprint(prisma, deptByName, customer.id, "TABLE-LEG", 60, [
    { dept: "Laser", order: 1, mins: 6, instructions: sop },
    { dept: "Grinding", order: 2, mins: 5, instructions: sop },
    { dept: "Forming", order: 3, mins: 7, instructions: sop },
    { dept: "Manual", order: 4, mins: 2, instructions: sop },
    { dept: "Welding", order: 5, mins: 30, instructions: sop },
    { dept: "Paint", order: 6, mins: 10, instructions: sop },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "TABLE-TOP", 87, [
    { dept: "Laser", order: 1, mins: 15, instructions: sop },
    { dept: "Grinding", order: 2, mins: 7, instructions: sop },
    { dept: "Forming", order: 3, mins: 5, instructions: sop },
    { dept: "Welding", order: 4, mins: 40, instructions: sop },
    { dept: "Paint", order: 5, mins: 20, instructions: sop },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "TABLE-7U", 30, [
    {
      dept: "Assembly",
      order: 1,
      mins: 30,
      instructions: "Final table assembly, torque hardware, and QC sign-off.",
      issues: [
        { part: "TABLE-LEG", qty: 4 },
        { part: "TABLE-TOP", qty: 1 },
      ],
    },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "HS-001", 35, [
    { dept: "Machining", order: 1, mins: 35, instructions: "Machine heat sink fins, deburr, and inspect flatness." },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "FAN-TURB-001", 20, [
    { dept: "Machining", order: 1, mins: 20, instructions: "Machine turbine hub to print." },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "FAN-BLADE-001", 29, [
    { dept: "Laser", order: 1, mins: 5, instructions: sop },
    { dept: "Grinding", order: 2, mins: 4, instructions: sop },
    { dept: "Forming", order: 3, mins: 3, instructions: sop },
    { dept: "Manual", order: 4, mins: 2, instructions: sop },
    { dept: "Paint", order: 5, mins: 15, instructions: sop },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "FAN-ASM-25", 25, [
    {
      dept: "Welding",
      order: 1,
      mins: 25,
      instructions: "Weld blades to turbine, balance check.",
      issues: [
        { part: "FAN-TURB-001", qty: 1 },
        { part: "FAN-BLADE-001", qty: 3 },
      ],
    },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "FRAME-20U", 31, [
    { dept: "Laser", order: 1, mins: 5, instructions: sop },
    { dept: "Grinding", order: 2, mins: 6, instructions: sop },
    { dept: "Forming", order: 3, mins: 3, instructions: sop },
    { dept: "Manual", order: 4, mins: 2, instructions: sop },
    { dept: "Paint", order: 5, mins: 15, instructions: sop },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "RACK-SIDE-L", 33, [
    { dept: "Laser", order: 1, mins: 10, instructions: sop },
    { dept: "Grinding", order: 2, mins: 6, instructions: sop },
    { dept: "Forming", order: 3, mins: 9, instructions: sop },
    { dept: "Manual", order: 4, mins: 8, instructions: sop },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "RACK-SIDE-R", 33, [
    { dept: "Laser", order: 1, mins: 10, instructions: sop },
    { dept: "Grinding", order: 2, mins: 6, instructions: sop },
    { dept: "Forming", order: 3, mins: 9, instructions: sop },
    { dept: "Manual", order: 4, mins: 8, instructions: sop },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "RACK-TOP", 28, [
    { dept: "Laser", order: 1, mins: 8, instructions: sop },
    { dept: "Grinding", order: 2, mins: 8, instructions: sop },
    { dept: "Forming", order: 3, mins: 12, instructions: sop },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "RACK-BOT", 26, [
    { dept: "Laser", order: 1, mins: 8, instructions: sop },
    { dept: "Grinding", order: 2, mins: 8, instructions: sop },
    { dept: "Forming", order: 3, mins: 10, instructions: sop },
  ]);

  await rebuildBlueprint(prisma, deptByName, customer.id, "RACK-5U", 215, [
    {
      dept: "Welding",
      order: 1,
      mins: 180,
      instructions: "Structural weld sequence for rack shell.",
      issues: [
        { part: "RACK-SIDE-L", qty: 1 },
        { part: "RACK-SIDE-R", qty: 1 },
        { part: "RACK-TOP", qty: 1 },
        { part: "RACK-BOT", qty: 1 },
      ],
    },
    { dept: "Paint", order: 2, mins: 35, instructions: "Powder prep, coat, and cure." },
  ]);
}
