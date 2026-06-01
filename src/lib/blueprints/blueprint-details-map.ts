import { prisma } from "@/lib/prisma";
import type { BlueprintDetail } from "@/lib/blueprints/blueprint-detail";

export async function getBlueprintDetailsMap(): Promise<Record<number, BlueprintDetail>> {
  const blueprints = await prisma.blueprint.findMany({
    orderBy: { partNumber: "asc" },
    include: {
      customer: { select: { id: true, name: true } },
      _count: { select: { jobs: true } },
      processBlueprints: {
        orderBy: { order: "asc" },
        include: { department: { select: { id: true, name: true } } },
      },
    },
  });

  const map: Record<number, BlueprintDetail> = {};
  for (const bp of blueprints) {
    map[bp.id] = {
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
  return map;
}
