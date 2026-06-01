import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";

export default async function HomePage() {
  const session = await verifySession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm uppercase tracking-wide text-[var(--muted)]">Soul Systems</p>
        <h1 className="mt-2 text-3xl font-semibold">Manufacturing workflow control</h1>
        <p className="mt-3 text-[var(--muted)]">
          Track multi-stage jobs, department queues, inventory issuance, and delay risk from a single
          operational surface.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
