import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { getWorkerDepartments } from "@/lib/workers/worker-departments";
import { DashboardNav } from "@/app/(user-site)/_components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.userRole === "ADMIN";
  const departmentLabel = isAdmin
    ? undefined
    : (await getWorkerDepartments(Number(session.userId))).label;

  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardNav isAdmin={isAdmin} departmentLabel={departmentLabel} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
