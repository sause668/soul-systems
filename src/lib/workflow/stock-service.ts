import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit/audit-log";

function normalizePartNumber(partNumber: string): string {
  const trimmed = partNumber.trim();
  if (!trimmed) throw new Error("Part number is required");
  return trimmed;
}

function assertQuantity(quantityStocked: number) {
  if (!Number.isInteger(quantityStocked) || quantityStocked < 0) {
    throw new Error("Quantity must be a whole number of zero or greater");
  }
}

export async function createStockPart(input: {
  partNumber: string;
  quantityStocked: number;
  actorUserId: number;
}) {
  const partNumber = normalizePartNumber(input.partNumber);
  assertQuantity(input.quantityStocked);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.stockPart.findUnique({ where: { partNumber } });
    if (existing) throw new Error("A stock record for this part number already exists");

    const row = await tx.stockPart.create({
      data: { partNumber, quantityStocked: input.quantityStocked },
    });

    await writeAudit(tx, {
      userId: input.actorUserId,
      action: "STOCK_CREATE",
      entityType: "StockPart",
      entityId: String(row.id),
      metadata: { partNumber, quantityStocked: input.quantityStocked },
    });

    return row;
  });
}

export async function updateStockPart(input: {
  stockPartId: number;
  partNumber: string;
  quantityStocked: number;
  actorUserId: number;
}) {
  const partNumber = normalizePartNumber(input.partNumber);
  assertQuantity(input.quantityStocked);

  return prisma.$transaction(async (tx) => {
    const row = await tx.stockPart.findUnique({ where: { id: input.stockPartId } });
    if (!row) throw new Error("Stock part not found");

    const duplicate = await tx.stockPart.findFirst({
      where: { partNumber, NOT: { id: row.id } },
    });
    if (duplicate) throw new Error("Another stock record already uses this part number");

    const updated = await tx.stockPart.update({
      where: { id: row.id },
      data: { partNumber, quantityStocked: input.quantityStocked },
    });

    await writeAudit(tx, {
      userId: input.actorUserId,
      action: "STOCK_UPDATE",
      entityType: "StockPart",
      entityId: String(row.id),
      metadata: { partNumber, quantityStocked: input.quantityStocked },
    });

    return updated;
  });
}

export async function deleteStockPart(input: { stockPartId: number; actorUserId: number }) {
  return prisma.$transaction(async (tx) => {
    const row = await tx.stockPart.findUnique({ where: { id: input.stockPartId } });
    if (!row) throw new Error("Stock part not found");

    await writeAudit(tx, {
      userId: input.actorUserId,
      action: "STOCK_DELETE",
      entityType: "StockPart",
      entityId: String(row.id),
      metadata: { partNumber: row.partNumber, quantityStocked: row.quantityStocked },
    });

    await tx.stockPart.delete({ where: { id: row.id } });
  });
}
