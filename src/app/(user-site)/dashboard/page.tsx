import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { AdminHome } from "@/app/(user-site)/dashboard/_components/AdminHome";
import { WorkerDepartmentHome } from "@/app/(user-site)/dashboard/_components/WorkerDepartmentHome";

export default async function AdminPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  if (session.userRole === "ADMIN") {
    return <AdminHome />;
  }

  return <WorkerDepartmentHome userId={Number(session.userId)} />;
}
