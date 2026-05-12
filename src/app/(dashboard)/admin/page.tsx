import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { AdminHome } from "@/app/(dashboard)/admin/_components/AdminHome";

export default async function AdminPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }
  if (session.userRole !== "ADMIN") {
    redirect("/worker");
  }

  return <AdminHome />;
}
