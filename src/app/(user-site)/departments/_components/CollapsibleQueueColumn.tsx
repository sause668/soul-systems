"use client";

import { useId, useState } from "react";
import { PartsRequiredPanel } from "@/app/(user-site)/departments/_components/PartsRequiredPanel";
import { ProcessCardW } from "@/app/(user-site)/departments/_components/ProcessCardW";
import type { Prisma } from "@/app/generated/prisma/client/client";

type ProcessWithRelations = Prisma.ProcessGetPayload<{
  include: {
    department: true;
    job: { include: { blueprint: true } };
    processBlueprint: { include: { issueBlueprints: true } };
    issueJobs: true;
  };
}>;

type Props = {
  title: string;
  processes: ProcessWithRelations[];
  isAdmin: boolean;
  userId: number;
  stockByPartNumber: Record<string, number>;
  /** Record-issuance form only on the Active column. Parts list shows on all columns when the step has blueprint lines. */
  showRecordIssuance?: boolean;
};

export function CollapsibleQueueColumn({
  title,
  processes,
  isAdmin,
  userId,
  stockByPartNumber,
  showRecordIssuance = false,
}: Props) {
  const panelId = useId();
  const [open, setOpen] = useState(true);

  return (
    <section className="panel flex min-h-0 flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? `Collapse ${title}` : `Expand ${title}`}</span>
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </header>
      <div
        id={panelId}
        hidden={!open}
        className="flex min-h-[120px] flex-1 flex-col gap-3 p-3 lg:min-h-[280px]"
      >
        {processes.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nothing here.</p>
        ) : (
          processes.map((p) => (
            <div key={p.id} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
              <ProcessCardW process={p} isAdmin={isAdmin} userId={userId} />
              <PartsRequiredPanel
                process={p}
                showRecordIssuance={showRecordIssuance}
                stockByPartNumber={stockByPartNumber}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
