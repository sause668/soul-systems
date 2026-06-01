import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/app/api/v1/_lib/http";
import { requireSession } from "@/app/api/v1/_lib/session-route";

export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const rows = await prisma.blueprint.findMany({
    orderBy: { partNumber: "asc" },
    include: {
      customer: { select: { name: true } },
      processBlueprints: {
        orderBy: { order: "asc" },
        include: { department: { select: { name: true } }, issueBlueprints: true },
      },
    },
  });

  return jsonOk(rows);
}
