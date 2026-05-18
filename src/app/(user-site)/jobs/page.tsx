import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { getCreateJobFormData } from "@/lib/jobs/create-job-form-data";
import { getJobDetailsList } from "@/lib/jobs/job-details-list";
import JobDetailsView from "@/app/(user-site)/jobs/_components/JobDetailsView";

export default async function JobsPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }
  if (session.userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const [rows, createJobData] = await Promise.all([getJobDetailsList(), getCreateJobFormData()]);

  return (
    <JobDetailsView
      rows={rows}
      blueprints={createJobData.blueprints}
      defaultDue={createJobData.defaultDue}
    />
  );
}
