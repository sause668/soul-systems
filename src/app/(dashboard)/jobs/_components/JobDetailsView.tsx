import JobDetailsClientShell from "@/app/(dashboard)/jobs/_components/JobDetailsClientShell";
import { jobDetailsToClientRows, type JobDetailsRow } from "@/lib/jobs/job-details-list";
import type { CreateJobBlueprintOption } from "@/lib/jobs/create-job-form-data";

type Props = {
  rows: JobDetailsRow[];
  blueprints: CreateJobBlueprintOption[];
  defaultDue: string;
};

export default function JobDetailsView({ rows, blueprints, defaultDue }: Props) {
  const clientRows = jobDetailsToClientRows(rows);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Operations</p>
        <h1 className="text-3xl font-semibold">Job Details</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Open jobs ordered by urgency: overdue first, then soonest due dates, then longest-running active
          steps in a department.
        </p>
      </header>

      <JobDetailsClientShell rows={clientRows} blueprints={blueprints} defaultDue={defaultDue} />
    </div>
  );
}
