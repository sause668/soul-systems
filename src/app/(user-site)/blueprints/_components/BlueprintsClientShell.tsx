"use client";

import { useState } from "react";
import BlueprintCreateFullPageModal from "@/app/(user-site)/blueprints/_components/BlueprintCreateFullPageModal";
import BlueprintEditFullPageModal from "@/app/(user-site)/blueprints/_components/BlueprintEditFullPageModal";
import BlueprintsSearchableTable from "@/app/(user-site)/blueprints/_components/BlueprintsSearchableTable";
import type { BlueprintFormOptions } from "@/lib/blueprints/blueprint-form-data";
import type { BlueprintDetail } from "@/lib/blueprints/blueprint-detail";
import type { BlueprintListClientRow } from "@/lib/blueprints/blueprint-list";

type Props = {
  rows: BlueprintListClientRow[];
  detailsById: Record<number, BlueprintDetail>;
  formOptions: BlueprintFormOptions;
};

export default function BlueprintsClientShell({ rows, detailsById, formOptions }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const editDetail = editId != null ? detailsById[editId] ?? null : null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New blueprint
        </button>
      </div>

      <BlueprintsSearchableTable
        rows={rows}
        onRowSelect={(row) => setEditId(row.id)}
      />

      <BlueprintCreateFullPageModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        formOptions={formOptions}
      />

      <BlueprintEditFullPageModal
        open={editDetail != null}
        onClose={() => setEditId(null)}
        detail={editDetail}
        formOptions={formOptions}
      />
    </>
  );
}
