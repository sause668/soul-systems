import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/app/api/v1/_lib/http";
import { requireSession } from "@/app/api/v1/_lib/session-route";

export async function GET(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const rows = await prisma.stockPart.findMany({
    where: q ? { partNumber: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { partNumber: "asc" },
    take: 100,
  });
  return jsonOk(rows);
}
