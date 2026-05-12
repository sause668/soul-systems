"use client";

import { useTransition } from "react";
import { actionIssueMaterial } from "@/app/_actions/manufacturing-actions";

export function IssueMaterialFormW({ processId }: { processId: number }) {
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
      <div className="font-semibold text-[var(--muted)]">Issue material</div>
      <div className="flex flex-col gap-2">
        <input
          name="partNumber"
          placeholder="Part number"
          className="rounded-md border border-[var(--border)] bg-transparent px-2 py-1"
          required
        />
        <input
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          className="rounded-md border border-[var(--border)] bg-transparent px-2 py-1"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[var(--border)] px-2 py-1 font-semibold disabled:opacity-50"
        >
          Record issuance
        </button>
      </div>
    </form>
  );
}
