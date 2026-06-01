import { prisma } from "@/lib/prisma";

export type BlueprintListRow = {
  id: number;
  partNumber: string;
  processCount: number;
  jobsCount: number;
  customerName: string;
};

export type BlueprintListClientRow = BlueprintListRow;

export async function getBlueprintList(): Promise<BlueprintListRow[]> {
  const blueprints = await prisma.blueprint.findMany({
    orderBy: { partNumber: "asc" },
    include: {
      customer: { select: { name: true } },
      _count: { select: { processBlueprints: true, jobs: true } },
    },
  });

  return blueprints
    .map((b) => ({
      id: b.id,
      partNumber: b.partNumber,
      processCount: b._count.processBlueprints,
      jobsCount: b._count.jobs,
      customerName: b.customer.name,
    }))
    .sort((a, b) => {
      if (b.jobsCount !== a.jobsCount) return b.jobsCount - a.jobsCount;
      return a.partNumber.localeCompare(b.partNumber);
    });
}
