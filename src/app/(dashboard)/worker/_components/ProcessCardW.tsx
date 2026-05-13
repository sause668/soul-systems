"use client";

import { useTransition } from "react";
import { actionCompleteProcess } from "@/app/_actions/manufacturing-actions";
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
  const [pending, start] = useTransition();
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
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => void actionCompleteProcess(process.id))}
          className="mt-1 rounded-md bg-[var(--success)] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
        >
          Mark step complete
        </button>
      ) : null}
      <div className="text-[10px] text-[var(--muted)]">
        Operator #{userId}
        {isAdmin ? " · admin override in Admin" : ""}
      </div>
    </div>
  );
}
