"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ConfirmActionModal } from "@/app/(user-site)/_components/ConfirmActionModal";
import { actionDeleteJob, actionUpdateJob } from "@/app/_actions/manufacturing-actions";
import type { JobDetailsClientRow } from "@/lib/jobs/job-details-list";

function dueInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  job: JobDetailsClientRow | null;
};

export default function JobEditFullPageModal({ open, onClose, job }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dueStr, setDueStr] = useState("");
  const [unitsStr, setUnitsStr] = useState("1");
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !job) return;
    setDueStr(dueInputValue(job.dueDate));
    setUnitsStr(String(job.numOfUnits));
    setSaveConfirmOpen(false);
    setDeleteConfirmOpen(false);
  }, [open, job]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saveConfirmOpen && !deleteConfirmOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, saveConfirmOpen, deleteConfirmOpen]);

  if (!mounted) return null;
  if (!open || !job) return null;

  const unitsNum = Number.parseInt(unitsStr, 10);
  const unitsValid = /^\d+$/.test(unitsStr.trim()) && unitsNum >= 1;
  const dueValid = dueStr.length >= 8;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-[var(--background)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-job-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-6">
          <h2 id="edit-job-modal-title" className="text-lg font-semibold text-[var(--foreground)]">
            Edit job #{job.jobId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--border)]"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-lg space-y-5 text-sm">
            <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <dt className="text-[var(--muted)]">Part</dt>
              <dd className="font-medium">{job.partNumber}</dd>
              <dt className="text-[var(--muted)]">Location</dt>
              <dd>{job.departmentName}</dd>
              <dt className="text-[var(--muted)]">Status</dt>
              <dd>{job.statusLabel}</dd>
            </dl>

            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <div className="font-semibold text-[var(--foreground)]">Editable</div>
              <label className="flex flex-col gap-1">
                <span className="text-[var(--muted)]">Due date</span>
                <input
                  type="date"
                  value={dueStr}
                  onChange={(e) => setDueStr(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[var(--muted)]">Units</span>
                <input
                  type="number"
                  min={1}
                  value={unitsStr}
                  onChange={(e) => setUnitsStr(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                disabled={!unitsValid || !dueValid}
                onClick={() => setSaveConfirmOpen(true)}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="rounded-md border border-[var(--critical)] px-4 py-2 text-sm font-semibold text-[var(--critical)] hover:bg-[var(--critical)]/10"
              >
                Delete job
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={saveConfirmOpen}
        title="Save job changes?"
        message={`Update job #${job.jobId} (${job.partNumber}): set due date to ${dueStr} and units to ${unitsNum}? This updates the job and all workflow step due dates and time estimates.`}
        confirmLabel="Save changes"
        cancelLabel="Cancel"
        variant="default"
        onCancel={() => setSaveConfirmOpen(false)}
        onConfirm={async () => {
          const res = await actionUpdateJob({
            jobId: job.jobId,
            dueDate: dueStr,
            numOfUnits: unitsNum,
          });
          if (!res.ok) throw new Error(res.error);
          setSaveConfirmOpen(false);
          router.refresh();
          onClose();
        }}
      />

      <ConfirmActionModal
        open={deleteConfirmOpen}
        title="Delete this job?"
        message={`Permanently delete job #${job.jobId} (${job.partNumber})? All process steps and issuance records for this job will be removed. This cannot be undone.`}
        confirmLabel="Delete job"
        cancelLabel="Cancel"
        variant="danger"
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          const res = await actionDeleteJob(job.jobId);
          if (!res.ok) throw new Error(res.error);
          setDeleteConfirmOpen(false);
          router.refresh();
          onClose();
        }}
      />
    </>,
    document.body,
  );
}