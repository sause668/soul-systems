import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { WorkerDashboard } from "@/app/(dashboard)/worker/_components/WorkerDashboard";

export default async function WorkerPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const userId = Number(session.userId);
  const isAdmin = session.userRole === "ADMIN";

  return <WorkerDashboard userId={userId} isAdmin={isAdmin} />;
}
