import { prisma } from "@/lib/prisma";

export type StockListRow = {
  id: number;
  partNumber: string;
  quantityStocked: number;
};

export type StockListClientRow = StockListRow;

export async function getStockList(): Promise<StockListRow[]> {
  const rows = await prisma.stockPart.findMany({
    orderBy: { partNumber: "asc" },
    select: { id: true, partNumber: true, quantityStocked: true },
  });
  return rows;
}
