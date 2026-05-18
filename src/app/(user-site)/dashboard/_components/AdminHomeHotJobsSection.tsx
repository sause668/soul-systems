import type { Prisma } from "@/app/generated/prisma/client/client";

export type AdminHomeHotJob = Prisma.JobGetPayload<{
  include: {
    blueprint: true;
    processes: { select: { id: true; status: true; departmentId: true } };
  };
}>;

type Props = {
  jobs: AdminHomeHotJob[];
};

export default function AdminHomeHotJobsSection({ jobs }: Props) {
  return (
    <div className="panel p-4">
      <div className="mb-3 text-sm font-semibold">Hot Jobs</div>
      <p className="mb-3 text-xs text-[var(--muted)]">
        Open jobs with the nearest due dates first (overdue and at-risk surface at the top).
      </p>
      <div className="overflow-x-auto text-sm">
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="pb-2">ID</th>
              <th className="pb-2">Part</th>
              <th className="pb-2">Due</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-[var(--border)]">
                <td className="py-2 font-mono text-xs">{job.id}</td>
                <td className="py-2">{job.blueprint.partNumber}</td>
                <td className="py-2 whitespace-nowrap">{job.dueDate.toLocaleDateString()}</td>
                <td className="py-2">
                  <span className="badge badge-neutral">{job.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
