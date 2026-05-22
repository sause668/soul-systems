"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ConfirmActionModal } from "@/app/(user-site)/_components/ConfirmActionModal";
import { actionCreateStockPart } from "@/app/_actions/stock-actions";

type Props = {
  open: boolean;
  onClose: () => void;
};

function validate(partNumber: string, quantityStr: string): string | null {
  if (!partNumber.trim()) return "Part number is required";
  const q = Number.parseInt(quantityStr, 10);
  if (!/^\d+$/.test(quantityStr.trim()) || q < 0) {
    return "Quantity must be a whole number of zero or greater";
  }
  return null;
}

export default function StockCreateFullPageModal({ open, onClose }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [partNumber, setPartNumber] = useState("");
  const [quantityStr, setQuantityStr] = useState("0");
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setPartNumber("");
    setQuantityStr("0");
    setSaveConfirmOpen(false);
    setFormError(null);
  }, [open]);

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

  const validationError = validate(partNumber, quantityStr);
  const quantityNum = Number.parseInt(quantityStr, 10);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-[var(--background)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-stock-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-6">
          <h2 id="create-stock-modal-title" className="text-lg font-semibold text-[var(--foreground)]">
            Add part to stock
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
            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <label className="flex flex-col gap-1">
                <span className="text-[var(--muted)]">Part number</span>
                <input
                  type="text"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[var(--muted)]">Quantity in stock</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={quantityStr}
                  onChange={(e) => setQuantityStr(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
            </div>

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
                Add part
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={saveConfirmOpen}
        title="Add part to stock?"
        message={`Create stock record for "${partNumber.trim() || "(part number)"}" with quantity ${quantityNum}?`}
        confirmLabel="Add part"
        cancelLabel="Cancel"
        variant="default"
        closeAfterConfirm={false}
        onCancel={() => setSaveConfirmOpen(false)}
        onConfirm={async () => {
          const err = validate(partNumber, quantityStr);
          if (err) {
            setFormError(err);
            throw new Error(err);
          }
          const res = await actionCreateStockPart({
            partNumber: partNumber.trim(),
            quantityStocked: quantityNum,
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
