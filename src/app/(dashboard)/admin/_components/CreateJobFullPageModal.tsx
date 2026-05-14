"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CreateJobFormClient } from "@/app/(dashboard)/admin/_components/CreateJobFormClient";
import type { CreateJobBlueprintOption } from "@/lib/jobs/create-job-form-data";

type Props = {
  open: boolean;
  onClose: () => void;
  blueprints: CreateJobBlueprintOption[];
  defaultDue: string;
};

export default function CreateJobFullPageModal({ open, onClose, blueprints, defaultDue }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[var(--background)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-job-modal-title"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-6">
        <h2 id="create-job-modal-title" className="text-lg font-semibold text-[var(--foreground)]">
          Create job
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
        <div className="mx-auto max-w-lg">
          <CreateJobFormClient
            blueprints={blueprints}
            defaultDue={defaultDue}
            onJobCreated={onClose}
            variant="modal"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
