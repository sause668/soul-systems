import { prisma } from "@/lib/prisma";

export type BlueprintProcessDetail = {
  id: number;
  departmentId: number;
  departmentName: string;
  order: number;
  processInstructions: string;
  timeEstimatePerUnit: number;
};

export type BlueprintDetail = {
  id: number;
  partNumber: string;
  timeEstimatePerUnit: number;
  customerId: number;
  customerName: string;
  jobsCount: number;
  processes: BlueprintProcessDetail[];
};

export async function getBlueprintDetail(blueprintId: number): Promise<BlueprintDetail | null> {
  const bp = await prisma.blueprint.findUnique({
    where: { id: blueprintId },
    include: {
      customer: { select: { id: true, name: true } },
      _count: { select: { jobs: true } },
      processBlueprints: {
        orderBy: { order: "asc" },
        include: { department: { select: { id: true, name: true } } },
      },
    },
  });
  if (!bp) return null;

  return {
    id: bp.id,
    partNumber: bp.partNumber,
    timeEstimatePerUnit: bp.timeEstimatePerUnit,
    customerId: bp.customerId,
    customerName: bp.customer.name,
    jobsCount: bp._count.jobs,
    processes: bp.processBlueprints.map((p) => ({
      id: p.id,
      departmentId: p.departmentId,
      departmentName: p.department.name,
      order: p.order,
      processInstructions: p.processInstructions,
      timeEstimatePerUnit: p.timeEstimatePerUnit,
    })),
  };
}
