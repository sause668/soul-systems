"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { actionCreateJob } from "@/app/_actions/manufacturing-actions";
import { ConfirmActionModal } from "@/app/(dashboard)/_components/ConfirmActionModal";

type BlueprintOption = { id: number; partNumber: string; timeEstimatePerUnit: number };

export function CreateJobFormClient({
  blueprints,
  defaultDue,
}: {
  blueprints: BlueprintOption[];
  defaultDue: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draft, setDraft] = useState<{
    blueprintId: number;
    numOfUnits: number;
    dueDate: string;
    partLabel: string;
  } | null>(null);

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const blueprintId = Number(fd.get("blueprintId"));
    const numOfUnits = Number(fd.get("numOfUnits"));
    const dueDate = String(fd.get("dueDate"));
    const bp = blueprints.find((b) => b.id === blueprintId);
    setDraft({
      blueprintId,
      numOfUnits,
      dueDate,
      partLabel: bp?.partNumber ?? `#${blueprintId}`,
    });
    setConfirmOpen(true);
  }

  return (
    <>
      <form onSubmit={onFormSubmit} className="panel flex flex-col gap-3 p-4 text-sm" id="create-job-form">
        <div className="font-semibold">Create job</div>
        <label className="flex flex-col gap-1">
          <span className="text-[var(--muted)]">Blueprint</span>
          <select
            name="blueprintId"
            className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2"
            required
          >
            {blueprints.map((b) => (
              <option key={b.id} value={b.id}>
                {b.partNumber} (~{b.timeEstimatePerUnit} min / unit)
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[var(--muted)]">Units</span>
          <input
            name="numOfUnits"
            type="number"
            min={1}
            defaultValue={1}
            className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[var(--muted)]">Due date</span>
          <input
            name="dueDate"
            type="date"
            defaultValue={defaultDue}
            className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-[var(--accent)] px-3 py-2 font-semibold text-white"
        >
          Instantiate workflow
        </button>
      </form>
      <ConfirmActionModal
        open={confirmOpen}
        title="Create job?"
        message={
          draft
            ? `This will create ${draft.numOfUnits} unit(s) of ${draft.partLabel} with due date ${draft.dueDate}. Workflows and process rows will be written to the database.`
            : ""
        }
        confirmLabel="Create job"
        cancelLabel="Cancel"
        variant="default"
        onCancel={() => {
          setConfirmOpen(false);
          setDraft(null);
        }}
        onConfirm={async () => {
          if (!draft) return;
          const res = await actionCreateJob({
            blueprintId: draft.blueprintId,
            numOfUnits: draft.numOfUnits,
            dueDate: draft.dueDate,
          });
          if (!res.ok) throw new Error(res.error);
          const form = document.getElementById("create-job-form") as HTMLFormElement | null;
          if (form?.isConnected) {
            form.reset();
            const due = form.querySelector<HTMLInputElement>('input[name="dueDate"]');
            if (due) due.value = defaultDue;
          }
          router.refresh();
        }}
      />
    </>
  );
}
