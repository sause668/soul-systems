"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";

export type ConfirmActionModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Primary button style */
  variant?: "default" | "danger";
  onCancel: () => void;
  /** Called when user confirms; close dialog in this handler or rely on `afterConfirmClose`. */
  onConfirm: () => void | Promise<void>;
  /** If true, `onCancel` is invoked after a successful `onConfirm` (default: true). */
  closeAfterConfirm?: boolean;
};

export function ConfirmActionModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onCancel,
  onConfirm,
  closeAfterConfirm = true,
}: ConfirmActionModalProps) {
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel, pending]);

  if (!open || !mounted) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-[var(--critical)] text-white hover:opacity-90"
      : "bg-[var(--accent)] text-white hover:opacity-90";

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="presentation">
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden
        onClick={() => {
          if (!pending) onCancel();
        }}
      />
      <div
        className="relative z-[1] w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-action-title"
        aria-describedby="confirm-action-desc"
      >
        <h2 id="confirm-action-title" className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p id="confirm-action-desc" className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--border)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await onConfirm();
                  if (closeAfterConfirm) onCancel();
                } catch {
                  // Keep dialog open so the user can read errors or adjust.
                }
              })
            }
            className={`rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50 ${confirmClass}`}
          >
            {pending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
