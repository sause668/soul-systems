import type { JobStatus } from "@/app/generated/prisma/client/client";
import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/app/api/v1/_lib/http";
import { requireSession } from "@/app/api/v1/_lib/session-route";

export async function GET(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const statusParam = searchParams.get("status");
  const allowed: JobStatus[] = ["DRAFT", "IN_PROGRESS", "COMPLETED", "ON_HOLD"];
  const statusFilter =
    statusParam && allowed.includes(statusParam as JobStatus) ? (statusParam as JobStatus) : undefined;

  const where = statusFilter ? { status: statusFilter } : {};

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: { blueprint: { select: { partNumber: true, timeEstimatePerUnit: true } } },
    }),
    prisma.job.count({ where }),
  ]);

  return jsonOk({ items, page, limit, total });
}
