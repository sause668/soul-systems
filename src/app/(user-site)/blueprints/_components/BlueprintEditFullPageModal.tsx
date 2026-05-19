"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ConfirmActionModal } from "@/app/(user-site)/_components/ConfirmActionModal";
import {
  BlueprintFields,
  BlueprintProcessSection,
  detailToProcessDrafts,
  processesToPayload,
  validateBlueprintForm,
} from "@/app/(user-site)/blueprints/_components/BlueprintFormShared";
import type { ProcessDraft } from "@/app/(user-site)/blueprints/_components/BlueprintProcessEditor";
import {
  actionDeleteBlueprint,
  actionUpdateBlueprint,
} from "@/app/_actions/blueprint-actions";
import type { BlueprintFormOptions } from "@/lib/blueprints/blueprint-form-data";
import type { BlueprintDetail } from "@/lib/blueprints/blueprint-detail";

type Props = {
  open: boolean;
  onClose: () => void;
  detail: BlueprintDetail | null;
  formOptions: BlueprintFormOptions;
};

export default function BlueprintEditFullPageModal({
  open,
  onClose,
  detail,
  formOptions,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [partNumber, setPartNumber] = useState("");
  const [timeEstimatePerUnit, setTimeEstimatePerUnit] = useState(0);
  const [processes, setProcesses] = useState<ProcessDraft[]>([]);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !detail) return;
    setPartNumber(detail.partNumber);
    setTimeEstimatePerUnit(detail.timeEstimatePerUnit);
    setProcesses(detailToProcessDrafts(detail));
    setSaveConfirmOpen(false);
    setDeleteConfirmOpen(false);
    setFormError(null);
  }, [open, detail]);

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
  if (!open || !detail) return null;

  const structureLocked = detail.jobsCount > 0;
  const validationError = validateBlueprintForm({
    partNumber,
    timeEstimatePerUnit,
    processes,
  });

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-[var(--background)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-blueprint-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-6">
          <h2 id="edit-blueprint-modal-title" className="text-lg font-semibold text-[var(--foreground)]">
            {detail.partNumber}
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
          <div className="mx-auto max-w-2xl space-y-5 text-sm">
            <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <dt className="text-[var(--muted)]">Customer</dt>
              <dd className="font-medium">{detail.customerName}</dd>
              <dt className="text-[var(--muted)]">Jobs using blueprint</dt>
              <dd>{detail.jobsCount}</dd>
              <dt className="text-[var(--muted)]">Process steps</dt>
              <dd>{detail.processes.length}</dd>
            </dl>

            <BlueprintFields
              partNumber={partNumber}
              timeEstimatePerUnit={timeEstimatePerUnit}
              onPartNumberChange={setPartNumber}
              onTimeEstimateChange={setTimeEstimatePerUnit}
              customerName={detail.customerName}
            />

            <BlueprintProcessSection
              processes={processes}
              departments={formOptions.departments}
              structureLocked={structureLocked}
              onProcessesChange={setProcesses}
            />

            {formError ? <p className="text-sm text-[var(--critical)]">{formError}</p> : null}

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                disabled={validationError != null}
                onClick={() => {
                  setFormError(null);
                  setSaveConfirmOpen(true);
                }}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Save changes
              </button>
              <button
                type="button"
                disabled={detail.jobsCount > 0}
                title={
                  detail.jobsCount > 0
                    ? "Remove all jobs using this blueprint before deleting"
                    : undefined
                }
                onClick={() => setDeleteConfirmOpen(true)}
                className="rounded-md border border-[var(--critical)] px-4 py-2 text-sm font-semibold text-[var(--critical)] hover:bg-[var(--critical)]/10 disabled:opacity-50"
              >
                Delete blueprint
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={saveConfirmOpen}
        title="Save blueprint changes?"
        message={`Update blueprint "${partNumber}" with ${processes.length} process step(s)?`}
        confirmLabel="Save changes"
        cancelLabel="Cancel"
        variant="default"
        closeAfterConfirm={false}
        onCancel={() => setSaveConfirmOpen(false)}
        onConfirm={async () => {
          const err = validateBlueprintForm({ partNumber, timeEstimatePerUnit, processes });
          if (err) {
            setFormError(err);
            throw new Error(err);
          }
          const res = await actionUpdateBlueprint({
            blueprintId: detail.id,
            partNumber: partNumber.trim(),
            timeEstimatePerUnit,
            processes: processesToPayload(processes),
          });
          if (!res.ok) {
            setFormError(res.error);
            throw new Error(res.error);
          }
          setSaveConfirmOpen(false);
          router.refresh();
          onClose();
        }}
      />

      <ConfirmActionModal
        open={deleteConfirmOpen}
        title="Delete this blueprint?"
        message={`Permanently delete blueprint "${detail.partNumber}" and all its process steps? This cannot be undone.`}
        confirmLabel="Delete blueprint"
        cancelLabel="Cancel"
        variant="danger"
        closeAfterConfirm={false}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          const res = await actionDeleteBlueprint(detail.id);
          if (!res.ok) {
            setFormError(res.error);
            throw new Error(res.error);
          }
          setDeleteConfirmOpen(false);
          router.refresh();
          onClose();
        }}
      />
    </>,
    document.body,
  );
}
