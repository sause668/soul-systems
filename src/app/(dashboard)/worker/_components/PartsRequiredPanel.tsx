"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
  /** Allow recording issuance in the detail modal (active queue only). */
  showRecordIssuance: boolean;
  /** Current `stockParts.quantityStocked` keyed by part number (page-level snapshot). */
  stockByPartNumber: Record<string, number>;
};

function formatInStock(partNumber: string, stockByPartNumber: Record<string, number>): string {
  const v = stockByPartNumber[partNumber];
  return v === undefined ? "—" : String(v);
}

function statusLabel(row: PartRequirementRow): string {
  if (row.required <= 0) return row.issued > 0 ? "Issued (no blueprint line)" : "—";
  if (row.issued >= row.required) return "Satisfied";
  if (row.issued <= 0) return "Not issued";
  return "Partial";
}

function RecordIssuanceInModal({
  processId,
  rows,
  stockByPartNumber,
}: {
  processId: number;
  rows: PartRequirementRow[];
  stockByPartNumber: Record<string, number>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-col gap-3 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const partNumber = String(fd.get("partNumber") ?? "").trim();
        const qty = Number(fd.get("quantity") ?? 0);
        if (!partNumber) return;
        start(async () => {
          await actionIssueMaterial({ processId, partNumber, quantityIssued: qty });
          if (form.isConnected) {
            form.reset();
          }
          router.refresh();
        });
      }}
    >
      <div className="font-semibold text-[var(--foreground)]">Record issuance</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
          <span className="text-xs text-[var(--muted)]">Part</span>
          <select
            name="partNumber"
            required
            defaultValue=""
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2 font-mono text-xs"
          >
            <option value="" disabled>
              Select part…
            </option>
            {rows.map((r) => (
              <option key={r.partNumber} value={r.partNumber}>
                {r.partNumber} — required {r.required}, issued {r.issued}, in stock{" "}
                {formatInStock(r.partNumber, stockByPartNumber)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex w-full flex-col gap-1 sm:w-28">
          <span className="text-xs text-[var(--muted)]">Quantity</span>
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2"
            required
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save issuance"}
        </button>
      </div>
    </form>
  );
}

function PartsDetailModal({
  jobLabel,
  processLabel,
  rows,
  processId,
  showRecordIssuance,
  stockByPartNumber,
  onClose,
}: {
  jobLabel: string;
  processLabel: string;
  rows: PartRequirementRow[];
  processId: number;
  showRecordIssuance: boolean;
  stockByPartNumber: Record<string, number>;
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
              Parts Required & Issued
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
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-[1] bg-[var(--panel)] text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-4">Part</th>
                  <th className="pb-2 pr-4">Required</th>
                  <th className="pb-2 pr-4">Issued</th>
                  <th className="pb-2 pr-4">In stock</th>
                  {/* <th className="pb-2 pr-4">Remaining</th> */}
                  {/* <th className="pb-2">Status</th> */}
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
                      <td className="py-3 pr-4">{formatInStock(r.partNumber, stockByPartNumber)}</td>
                      {/* <td className="py-3 pr-4">{r.required > 0 ? remaining : "—"}</td> */}
                      {/* <td className="py-3 text-xs text-[var(--muted)]">{statusLabel(r)}</td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Required totals use blueprint line quantities multiplied by the job unit count. Issued totals sum
              issuance records for this process step. In stock reflects the current{" "}
              <span className="font-medium">stockParts</span> quantity for each part (no row in inventory means “—”).
            </p>
          </div>
          {showRecordIssuance ? (
            <div className="shrink-0 border-t border-[var(--border)] bg-[var(--background)] px-5 py-4">
              <RecordIssuanceInModal
                processId={processId}
                rows={rows}
                stockByPartNumber={stockByPartNumber}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function PartsRequiredPanel({ process, showRecordIssuance, stockByPartNumber }: Props) {
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
            <span className="text-xs text-[var(--muted)]">{statusLabel(r)}</span>
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
      {mounted && modalOpen ? (
        <PartsDetailModal
          jobLabel={jobLabel}
          processLabel={processLabel}
          rows={rows}
          processId={process.id}
          showRecordIssuance={showRecordIssuance}
          stockByPartNumber={stockByPartNumber}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}
