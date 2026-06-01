import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { getJobArchivesList } from "@/lib/jobs/job-archives-list";
import JobArchivesView from "@/app/(user-site)/jobs/archives/_components/JobArchivesView";

export default async function JobArchivesPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }
  if (session.userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const rows = await getJobArchivesList();

  return <JobArchivesView rows={rows} />;
}
