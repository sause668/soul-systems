import type { PrismaClient } from "@/app/generated/prisma/client/client";

type ProcessLike = {
  processBlueprint: { issueBlueprints: { partNumber: string }[] } | null;
  issueJobs: { partNumber: string }[];
};

export function collectPartNumbersFromProcesses(processes: ProcessLike[]): string[] {
  const set = new Set<string>();
  for (const p of processes) {
    for (const ib of p.processBlueprint?.issueBlueprints ?? []) {
      set.add(ib.partNumber);
    }
    for (const ij of p.issueJobs) {
      set.add(ij.partNumber);
    }
  }
  return [...set];
}

export async function fetchStockByPartNumber(
  prisma: PrismaClient,
  partNumbers: string[],
): Promise<Record<string, number>> {
  if (partNumbers.length === 0) return {};
  const rows = await prisma.stockPart.findMany({
    where: { partNumber: { in: partNumbers } },
    select: { partNumber: true, quantityStocked: true },
  });
  return Object.fromEntries(rows.map((r) => [r.partNumber, r.quantityStocked]));
}
