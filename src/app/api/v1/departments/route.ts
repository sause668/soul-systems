import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/app/api/v1/_lib/http";
import { requireSession } from "@/app/api/v1/_lib/session-route";

export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const rows = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return jsonOk(rows);
}
