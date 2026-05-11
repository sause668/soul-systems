import { IssueMaterialFormW } from "@/app/worker/_components/IssueMaterialFormW";
import { ProcessCardW } from "@/app/worker/_components/ProcessCardW";
import type { Prisma } from "@/app/generated/prisma/client/client";

type ProcessWithRelations = Prisma.ProcessGetPayload<{
  include: {
    department: true;
    job: { include: { blueprint: true } };
    processBlueprint: true;
    issueJobs: true;
  };
}>;

export function ProcessQueuesW({
  active,
  queued,
  overdue,
  isAdmin,
  userId,
}: {
  active: ProcessWithRelations[];
  queued: ProcessWithRelations[];
  overdue: ProcessWithRelations[];
  isAdmin: boolean;
  userId: number;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <QueueColumn title="Active" processes={active} isAdmin={isAdmin} userId={userId} />
      <QueueColumn title="Queued" processes={queued} isAdmin={isAdmin} userId={userId} />
      <QueueColumn title="Overdue" processes={overdue} isAdmin={isAdmin} userId={userId} />
    </div>
  );
}

function QueueColumn({
  title,
  processes,
  isAdmin,
  userId,
}: {
  title: string;
  processes: ProcessWithRelations[];
  isAdmin: boolean;
  userId: number;
}) {
  return (
    <section className="panel flex min-h-[320px] flex-col">
      <header className="border-b border-[var(--border)] px-4 py-3 text-sm font-semibold">{title}</header>
      <div className="flex flex-1 flex-col gap-3 p-3">
        {processes.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nothing here.</p>
        ) : (
          processes.map((p) => (
            <div key={p.id} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
              <ProcessCardW process={p} isAdmin={isAdmin} userId={userId} />
              <IssueMaterialFormW processId={p.id} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
