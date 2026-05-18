import { prisma } from "@/lib/prisma";

export type WorkerDepartmentInfo = {
  departmentIds: number[];
  departmentNames: string[];
  label: string;
};

export async function getWorkerDepartments(userId: number): Promise<WorkerDepartmentInfo> {
  const rows = await prisma.worker.findMany({
    where: { userId },
    select: { departmentId: true, department: { select: { name: true } } },
    orderBy: { department: { name: "asc" } },
  });

  const departmentIds = rows.map((r) => r.departmentId);
  const departmentNames = rows.map((r) => r.department.name);
  const label =
    departmentNames.length === 0
      ? "Unassigned"
      : departmentNames.length === 1
        ? departmentNames[0]!
        : departmentNames.join(", ");

  return { departmentIds, departmentNames, label };
}
