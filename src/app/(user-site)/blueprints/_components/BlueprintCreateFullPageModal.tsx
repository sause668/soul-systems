"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ConfirmActionModal } from "@/app/(user-site)/_components/ConfirmActionModal";
import {
  BlueprintFields,
  BlueprintProcessSection,
  processesToPayload,
  validateBlueprintForm,
} from "@/app/(user-site)/blueprints/_components/BlueprintFormShared";
import type { ProcessDraft } from "@/app/(user-site)/blueprints/_components/BlueprintProcessEditor";
import { actionCreateBlueprint } from "@/app/_actions/blueprint-actions";
import type { BlueprintFormOptions } from "@/lib/blueprints/blueprint-form-data";

function initialProcess(): ProcessDraft {
  return {
    key: "step-1",
    departmentId: 0,
    order: 1,
    processInstructions: "",
    timeEstimatePerUnit: 0,
  };
}

type Props = {
  open: boolean;
  onClose: () => void;
  formOptions: BlueprintFormOptions;
};

export default function BlueprintCreateFullPageModal({ open, onClose, formOptions }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customerId, setCustomerId] = useState(0);
  const [partNumber, setPartNumber] = useState("");
  const [timeEstimatePerUnit, setTimeEstimatePerUnit] = useState(0);
  const [processes, setProcesses] = useState<ProcessDraft[]>([initialProcess()]);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCustomerId(formOptions.customers[0]?.id ?? 0);
    setPartNumber("");
    setTimeEstimatePerUnit(0);
    setProcesses([initialProcess()]);
    setSaveConfirmOpen(false);
    setFormError(null);
  }, [open, formOptions.customers]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saveConfirmOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, saveConfirmOpen]);

  if (!open || !mounted) return null;

  const validationError = validateBlueprintForm({
    customerId,
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
        aria-labelledby="create-blueprint-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-6">
          <h2 id="create-blueprint-modal-title" className="text-lg font-semibold text-[var(--foreground)]">
            New blueprint
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
            <BlueprintFields
              partNumber={partNumber}
              timeEstimatePerUnit={timeEstimatePerUnit}
              onPartNumberChange={setPartNumber}
              onTimeEstimateChange={setTimeEstimatePerUnit}
              customerId={customerId}
              customers={formOptions.customers}
              onCustomerChange={setCustomerId}
            />

            <BlueprintProcessSection
              processes={processes}
              departments={formOptions.departments}
              structureLocked={false}
              onProcessesChange={setProcesses}
            />

            {formError ? <p className="text-sm text-[var(--critical)]">{formError}</p> : null}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={validationError != null}
                onClick={() => {
                  setFormError(null);
                  setSaveConfirmOpen(true);
                }}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Create blueprint
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={saveConfirmOpen}
        title="Create blueprint?"
        message={`Create blueprint "${partNumber.trim() || "(part number)"}" with ${processes.length} process step(s)?`}
        confirmLabel="Create blueprint"
        cancelLabel="Cancel"
        variant="default"
        closeAfterConfirm={false}
        onCancel={() => setSaveConfirmOpen(false)}
        onConfirm={async () => {
          const err = validateBlueprintForm({
            customerId,
            partNumber,
            timeEstimatePerUnit,
            processes,
          });
          if (err) {
            setFormError(err);
            throw new Error(err);
          }
          const res = await actionCreateBlueprint({
            customerId,
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
    </>,
    document.body,
  );
}
