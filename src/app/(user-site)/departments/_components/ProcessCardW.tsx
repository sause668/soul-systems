"use client";

import { useState } from "react";
import {
  actionCompleteProcess,
  actionRevertProcess,
} from "@/app/_actions/manufacturing-actions";
import { ConfirmActionModal } from "@/app/(user-site)/_components/ConfirmActionModal";
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
  const [confirmRevert, setConfirmRevert] = useState(false);
  const instructions = process.processBlueprint?.processInstructions ?? "—";
  const remaining = process.estimatedMinutes;
  const canMoveBack = process.order > 1;

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
          <div className="mt-1 flex items-stretch gap-1.5">
            <button
              type="button"
              onClick={() => setConfirmComplete(true)}
              className="flex-1 rounded-md bg-[var(--success)] px-3 py-1.5 text-xs font-semibold text-black"
            >
              Mark step complete
            </button>
            <button
              type="button"
              onClick={() => canMoveBack && setConfirmRevert(true)}
              disabled={!canMoveBack}
              title={
                canMoveBack
                  ? "Move job back to previous step"
                  : "This is the first step; cannot move back"
              }
              aria-label="Move job back to previous step"
              className="shrink-0 basis-1/5 min-w-[2.25rem] rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--border)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Back
            </button>
          </div>
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
          <ConfirmActionModal
            open={confirmRevert}
            title="Move job back a step?"
            message={`This will return job #${process.jobId} (${process.job.blueprint.partNumber}) from ${process.department.name} to the previous step. The current step will be queued again and the previous step will be reactivated.`}
            confirmLabel="Move back"
            cancelLabel="Cancel"
            variant="default"
            onCancel={() => setConfirmRevert(false)}
            onConfirm={async () => {
              const res = await actionRevertProcess(process.id);
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
