import { prisma } from "@/lib/prisma";

export type CreateJobBlueprintOption = {
  id: number;
  partNumber: string;
  timeEstimatePerUnit: number;
};

export async function getCreateJobFormData(): Promise<{
  blueprints: CreateJobBlueprintOption[];
  defaultDue: string;
}> {
  const blueprints = await prisma.blueprint.findMany({
    orderBy: { partNumber: "asc" },
    select: { id: true, partNumber: true, timeEstimatePerUnit: true },
    take: 50,
  });

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 21);

  return {
    blueprints,
    defaultDue: defaultDue.toISOString().slice(0, 10),
  };
}
