"use client";

import Link from "next/link";
import { useState } from "react";
import CreateJobFullPageModal from "@/app/(dashboard)/admin/_components/CreateJobFullPageModal";
import JobDetailsSearchableTable from "@/app/(dashboard)/jobs/_components/JobDetailsSearchableTable";
import JobEditFullPageModal from "@/app/(dashboard)/jobs/_components/JobEditFullPageModal";
import type { CreateJobBlueprintOption } from "@/lib/jobs/create-job-form-data";
import type { JobDetailsClientRow } from "@/lib/jobs/job-details-list";

type Props = {
  rows: JobDetailsClientRow[];
  blueprints: CreateJobBlueprintOption[];
  defaultDue: string;
};

export default function JobDetailsClientShell({ rows, blueprints, defaultDue }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editJob, setEditJob] = useState<JobDetailsClientRow | null>(null);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/jobs/archives"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)]"
        >
          Job archives
        </Link>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Create job
        </button>
      </div>

      <JobDetailsSearchableTable rows={rows} onRowSelect={(row) => setEditJob(row)} />

      <CreateJobFullPageModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        blueprints={blueprints}
        defaultDue={defaultDue}
      />

      <JobEditFullPageModal
        open={editJob != null}
        onClose={() => setEditJob(null)}
        job={editJob}
      />
    </>
  );
}
