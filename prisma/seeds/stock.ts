import type { PrismaClient } from "../../src/app/generated/prisma/client/client";

const PARTS: { partNumber: string; quantityStocked: number }[] = [
  { partNumber: "TABLE-LEG", quantityStocked: 500 },
  { partNumber: "TABLE-TOP", quantityStocked: 200 },
  { partNumber: "FAN-TURB-001", quantityStocked: 400 },
  { partNumber: "FAN-BLADE-001", quantityStocked: 2000 },
  { partNumber: "RACK-SIDE-L", quantityStocked: 120 },
  { partNumber: "RACK-SIDE-R", quantityStocked: 120 },
  { partNumber: "RACK-TOP", quantityStocked: 120 },
  { partNumber: "RACK-BOT", quantityStocked: 120 },
  { partNumber: "RAW-STEEL-5052", quantityStocked: 10000 },
];

export async function seedStock(prisma: PrismaClient) {
  for (const part of PARTS) {
    await prisma.stockPart.upsert({
      where: { partNumber: part.partNumber },
      create: part,
      update: { quantityStocked: part.quantityStocked },
    });
  }
}
