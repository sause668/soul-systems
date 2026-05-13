"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { actionIssueMaterial } from "@/app/_actions/manufacturing-actions";
import type { Prisma } from "@/app/generated/prisma/client/client";
import {
  buildPartRequirementRows,
  hasBlueprintPartRequirements,
  type PartRequirementRow,
} from "@/app/(dashboard)/worker/_components/parts-required-utils";

type ProcessWithParts = Prisma.ProcessGetPayload<{
  include: {
    department: true;
    job: { include: { blueprint: true } };
    processBlueprint: { include: { issueBlueprints: true } };
    issueJobs: true;
  };
}>;

type Props = {
  process: ProcessWithParts;
  /** Show record-issuance form (active queue only). */
  showRecordIssuance: boolean;
};

function statusLabel(row: PartRequirementRow): string {
  if (row.required <= 0) return row.issued > 0 ? "Issued (no blueprint line)" : "—";
  if (row.issued >= row.required) return "Satisfied";
  if (row.issued <= 0) return "Not issued";
  return "Partial";
}

function PartsDetailModal({
  jobLabel,
  processLabel,
  rows,
  onClose,
}: {
  jobLabel: string;
  processLabel: string;
  rows: PartRequirementRow[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-black/70" aria-hidden onClick={onClose} />
      <div
        className="relative z-[1] flex max-h-[calc(100dvh-2rem)] min-h-[min(85dvh,40rem)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="parts-modal-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p id="parts-modal-title" className="text-lg font-semibold">
              Parts required & issued
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {jobLabel} · {processLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--border)]"
          >
            Close
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-[1] bg-[var(--panel)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="pb-2 pr-4">Part</th>
                <th className="pb-2 pr-4">Required</th>
                <th className="pb-2 pr-4">Issued</th>
                <th className="pb-2">Remaining</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const remaining = Math.max(0, r.required - r.issued);
                return (
                  <tr key={r.partNumber} className="border-t border-[var(--border)]">
                    <td className="py-3 pr-4 font-mono text-xs font-medium">{r.partNumber}</td>
                    <td className="py-3 pr-4">{r.required}</td>
                    <td className="py-3 pr-4">{r.issued}</td>
                    <td className="py-3 pr-4">{r.required > 0 ? remaining : "—"}</td>
                    <td className="py-3 text-xs text-[var(--muted)]">{statusLabel(r)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Required totals use blueprint line quantities multiplied by the job unit count. Issued totals sum
            issuance records for this process step.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function RecordPartsIssuedForm({ processId }: { processId: number }) {
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const partNumber = String(fd.get("partNumber") ?? "").trim();
        const qty = Number(fd.get("quantity") ?? 0);
        start(async () => {
          await actionIssueMaterial({ processId, partNumber, quantityIssued: qty });
          e.currentTarget.reset();
        });
      }}
    >
      <div className="font-semibold text-[var(--muted)]">Record issuance</div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <input
          name="partNumber"
          placeholder="Part number"
          className="min-w-[10rem] flex-1 rounded-md border border-[var(--border)] bg-transparent px-2 py-1"
          required
        />
        <input
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          className="w-24 rounded-md border border-[var(--border)] bg-transparent px-2 py-1"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[var(--border)] px-3 py-1 font-semibold disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export function PartsRequiredPanel({ process, showRecordIssuance }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rows = useMemo(() => buildPartRequirementRows(process), [process]);
  const hasRequirements = hasBlueprintPartRequirements(process);

  const jobLabel = `Job #${process.jobId} · ${process.job.blueprint.partNumber}`;
  const processLabel = `${process.department.name} · Step ${process.order}`;

  const inlineRows = useMemo(() => rows.filter((r) => r.required > 0), [rows]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  if (!hasRequirements) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-[var(--border)] pt-3 text-xs">
      <div className="font-semibold text-[var(--foreground)]">Parts required</div>
      <ul className="mt-2 space-y-1.5">
        {inlineRows.map((r) => (
          <li key={r.partNumber} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-mono font-medium">{r.partNumber}</span>
            <span className="text-[var(--muted)]">
              Required <span className="text-[var(--foreground)]">{r.required}</span>
              {r.issued > 0 ? (
                <>
                  {" "}
                  · Issued <span className="text-[var(--foreground)]">{r.issued}</span>
                </>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={openModal}
        className="mt-2 text-left text-xs font-semibold text-[var(--accent)] hover:underline"
      >
        Full details…
      </button>
      {showRecordIssuance ? <RecordPartsIssuedForm processId={process.id} /> : null}
      {mounted && modalOpen ? (
        <PartsDetailModal
          jobLabel={jobLabel}
          processLabel={processLabel}
          rows={rows}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}
