import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { AdminHome } from "@/app/admin/_components/AdminHome";
import { logoutUser } from "@/app/_actions/user-actions";

async function logoutAction() {
  "use server";
  await logoutUser();
  redirect("/login");
}

export default async function AdminPage() {
  const session = await verifySession();
  if (!session) redirect("/login");
  if (session.userRole !== "ADMIN") redirect("/worker");

  return (
    <div className="min-h-dvh">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="text-sm font-semibold">Soul Systems · Admin</div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            Sign out
          </button>
        </form>
      </div>
      <AdminHome />
    </div>
  );
}
