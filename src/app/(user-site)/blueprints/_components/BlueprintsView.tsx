import BlueprintsClientShell from "@/app/(user-site)/blueprints/_components/BlueprintsClientShell";
import type { BlueprintFormOptions } from "@/lib/blueprints/blueprint-form-data";
import type { BlueprintDetail } from "@/lib/blueprints/blueprint-detail";
import type { BlueprintListRow } from "@/lib/blueprints/blueprint-list";

type Props = {
  rows: BlueprintListRow[];
  detailsById: Record<number, BlueprintDetail>;
  formOptions: BlueprintFormOptions;
};

export default function BlueprintsView({ rows, detailsById, formOptions }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Operations</p>
        <h1 className="text-3xl font-semibold">Blueprints</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Manufacturing templates for each part: process steps by department, time estimates, and how often each
          blueprint is used on jobs.
        </p>
      </header>

      <BlueprintsClientShell rows={rows} detailsById={detailsById} formOptions={formOptions} />
    </div>
  );
}
