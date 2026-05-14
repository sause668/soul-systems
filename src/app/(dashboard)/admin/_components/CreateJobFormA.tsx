import { prisma } from "@/lib/prisma";
import { CreateJobFormClient } from "@/app/(dashboard)/admin/_components/CreateJobFormClient";

export async function CreateJobFormA() {
  const blueprints = await prisma.blueprint.findMany({
    orderBy: { partNumber: "asc" },
    select: { id: true, partNumber: true, timeEstimatePerUnit: true },
    take: 50,
  });

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 21);
  const dueValue = defaultDue.toISOString().slice(0, 10);

  return <CreateJobFormClient blueprints={blueprints} defaultDue={dueValue} />;
}
