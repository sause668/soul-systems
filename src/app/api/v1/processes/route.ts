import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/app/api/v1/_lib/http";
import { requireSession } from "@/app/api/v1/_lib/session-route";

export async function GET(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get("departmentId");
  const jobId = searchParams.get("jobId");

  const where = {
    ...(departmentId ? { departmentId: Number(departmentId) } : {}),
    ...(jobId ? { jobId: Number(jobId) } : {}),
  };

  const rows = await prisma.process.findMany({
    where,
    orderBy: [{ jobId: "asc" }, { order: "asc" }],
    include: {
      department: { select: { name: true } },
      job: { select: { id: true, numOfUnits: true, dueDate: true, status: true } },
    },
  });

  return jsonOk(rows);
}
