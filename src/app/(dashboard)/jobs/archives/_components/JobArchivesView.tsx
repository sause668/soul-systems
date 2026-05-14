import JobArchivesSearchableTable from "@/app/(dashboard)/jobs/_components/JobArchivesSearchableTable";
import { jobArchivesToClientRows, type JobArchiveRow } from "@/lib/jobs/job-archives-list";

type Props = {
  rows: JobArchiveRow[];
};

export default function JobArchivesView({ rows }: Props) {
  const clientRows = jobArchivesToClientRows(rows);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Operations</p>
        <h1 className="text-3xl font-semibold">Job Archives</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Completed jobs, most recently closed first. Closing status highlights work finished after the due date
          or within three calendar days before it.
        </p>
      </header>

      <JobArchivesSearchableTable rows={clientRows} />
    </div>
  );
}
