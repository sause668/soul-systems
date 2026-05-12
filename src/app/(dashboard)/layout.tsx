import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { DashboardNav } from "@/app/(dashboard)/_components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.userRole === "ADMIN";

  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardNav isAdmin={isAdmin} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
