"use client";

import { useState } from "react";
import StockCreateFullPageModal from "@/app/(user-site)/stock/_components/StockCreateFullPageModal";
import StockEditFullPageModal from "@/app/(user-site)/stock/_components/StockEditFullPageModal";
import StockSearchableTable from "@/app/(user-site)/stock/_components/StockSearchableTable";
import type { StockListClientRow } from "@/lib/stock/stock-list";

type Props = {
  rows: StockListClientRow[];
};

export default function StockClientShell({ rows }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPart, setEditPart] = useState<StockListClientRow | null>(null);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Add part to stock
        </button>
      </div>

      <StockSearchableTable rows={rows} onRowSelect={(row) => setEditPart(row)} />

      <StockCreateFullPageModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <StockEditFullPageModal
        open={editPart != null}
        onClose={() => setEditPart(null)}
        part={editPart}
      />
    </>
  );
}
