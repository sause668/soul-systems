import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { WorkerDashboard } from "@/app/worker/_components/WorkerDashboard";
import { logoutUser } from "@/app/_actions/user-actions";

async function logoutAction() {
  "use server";
  await logoutUser();
  redirect("/login");
}

export default async function WorkerPage() {
  const session = await verifySession();
  if (!session) redirect("/login");

  const userId = Number(session.userId);
  const isAdmin = session.userRole === "ADMIN";

  return (
    <div className="min-h-dvh">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="text-sm font-semibold">Soul Systems · Floor</div>
        <div className="flex items-center gap-3 text-sm">
          {isAdmin ? (
            <Link href="/admin" className="text-[var(--accent)]">
              Admin overview
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button type="submit" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <WorkerDashboard userId={userId} isAdmin={isAdmin} />
    </div>
  );
}
