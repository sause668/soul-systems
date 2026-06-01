import type { Prisma } from "@/app/generated/prisma/client/client";
import type { PrismaClient } from "@/app/generated/prisma/client/client";

type Db = PrismaClient | Prisma.TransactionClient;

export async function writeAudit(
  db: Db,
  input: {
    userId: number | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Prisma.InputJsonValue;
  },
) {
  await db.auditLog.create({
    data: {
      userId: input.userId ?? undefined,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}
