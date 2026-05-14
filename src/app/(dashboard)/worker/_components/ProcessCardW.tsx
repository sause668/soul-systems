"use client";

import { useState } from "react";
import { actionCompleteProcess } from "@/app/_actions/manufacturing-actions";
import { ConfirmActionModal } from "@/app/(dashboard)/_components/ConfirmActionModal";
import type { Prisma } from "@/app/generated/prisma/client/client";

type ProcessWithRelations = Prisma.ProcessGetPayload<{
  include: {
    department: true;
    job: { include: { blueprint: true } };
    processBlueprint: { include: { issueBlueprints: true } };
    issueJobs: true;
  };
}>;

export function ProcessCardW({
  process,
  isAdmin,
  userId,
}: {
  process: ProcessWithRelations;
  isAdmin: boolean;
  userId: number;
}) {
  const [confirmComplete, setConfirmComplete] = useState(false);
  const instructions = process.processBlueprint?.processInstructions ?? "—";
  const remaining = process.estimatedMinutes;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge badge-neutral">{process.department.name}</span>
        <span className="text-xs text-[var(--muted)]">Job #{process.jobId}</span>
        <span className="text-xs text-[var(--muted)]">Step {process.order}</span>
      </div>
      <div className="font-medium">{process.job.blueprint.partNumber}</div>
      <div className="text-xs text-[var(--muted)]">Units: {process.job.numOfUnits}</div>
      <div className="rounded-md border border-[var(--border)] bg-[var(--background)]/40 p-2 text-xs leading-relaxed">
        {instructions}
      </div>
      <div className="text-xs text-[var(--muted)]">
        Est. remaining work (dept scope): ~{remaining} min · Due {process.dueDate.toDateString()}
      </div>
      {process.status === "ACTIVE" ? (
        <>
          <button
            type="button"
            onClick={() => setConfirmComplete(true)}
            className="mt-1 rounded-md bg-[var(--success)] px-3 py-1.5 text-xs font-semibold text-black"
          >
            Mark step complete
          </button>
          <ConfirmActionModal
            open={confirmComplete}
            title="Mark step complete?"
            message={`This will complete the active step for job #${process.jobId} (${process.job.blueprint.partNumber}) in ${process.department.name} and advance the workflow. This cannot be undone from the floor console.`}
            confirmLabel="Complete step"
            cancelLabel="Cancel"
            variant="default"
            onCancel={() => setConfirmComplete(false)}
            onConfirm={async () => {
              const res = await actionCompleteProcess(process.id);
              if (!res.ok) throw new Error(res.error);
            }}
          />
        </>
      ) : null}
      <div className="text-[10px] text-[var(--muted)]">
        Operator #{userId}
        {isAdmin ? " · admin override in Admin" : ""}
      </div>
    </div>
  );
}
