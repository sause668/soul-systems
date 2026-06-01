import { CollapsibleQueueColumn } from "@/app/(user-site)/departments/_components/CollapsibleQueueColumn";
import type { Prisma } from "@/app/generated/prisma/client/client";

type ProcessWithRelations = Prisma.ProcessGetPayload<{
  include: {
    department: true;
    job: { include: { blueprint: true } };
    processBlueprint: { include: { issueBlueprints: true } };
    issueJobs: true;
  };
}>;

export function ProcessQueuesW({
  active,
  queued,
  overdue,
  isAdmin,
  userId,
  stockByPartNumber,
}: {
  active: ProcessWithRelations[];
  queued: ProcessWithRelations[];
  overdue: ProcessWithRelations[];
  isAdmin: boolean;
  userId: number;
  stockByPartNumber: Record<string, number>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <CollapsibleQueueColumn
        title="Active"
        processes={active}
        isAdmin={isAdmin}
        userId={userId}
        stockByPartNumber={stockByPartNumber}
        showRecordIssuance
      />
      <CollapsibleQueueColumn
        title="Queued"
        processes={queued}
        isAdmin={isAdmin}
        userId={userId}
        stockByPartNumber={stockByPartNumber}
      />
      <CollapsibleQueueColumn
        title="Overdue"
        processes={overdue}
        isAdmin={isAdmin}
        userId={userId}
        stockByPartNumber={stockByPartNumber}
      />
    </div>
  );
}
