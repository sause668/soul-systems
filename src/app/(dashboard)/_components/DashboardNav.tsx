"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutAndRedirectToLogin } from "@/app/_actions/user-actions";

type Props = {
  isAdmin: boolean;
};

function linkClass(active: boolean) {
  return [
    "rounded-md px-2 py-1 transition-colors",
    active
      ? "bg-[var(--accent-muted)] font-semibold text-[var(--foreground)]"
      : "text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]",
  ].join(" ");
}

export function DashboardNav({ isAdmin }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname.startsWith("/admin");
  const isWorkerRoute = pathname.startsWith("/worker");
  const isDepartmentsRoute = pathname.startsWith("/departments");

  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  const createJobActive = isAdminRoute && hash === "#create-job";

  const contextLabel = isAdminRoute ? "Admin" : isDepartmentsRoute ? "Workflows" : "Floor";

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <Link
          href="/"
          className="truncate text-sm font-bold tracking-tight text-[var(--foreground)] hover:text-[var(--accent)]"
        >
          Soul Systems
        </Link>
        <span className="hidden text-xs text-[var(--muted)] sm:inline" aria-hidden>
          ·
        </span>
        <span className="text-xs font-medium text-[var(--muted)]">{contextLabel}</span>
      </div>

      <nav
        className="flex flex-wrap items-center gap-1 text-sm sm:gap-2"
        aria-label="Primary"
      >
        <Link href="/" className={linkClass(pathname === "/")}>
          Home
        </Link>
        {isAdmin ? (
          <Link href="/departments" className={linkClass(isDepartmentsRoute)}>
            Workflows
          </Link>
        ) : (
          <Link href="/worker#queues" className={linkClass(isWorkerRoute)}>
            Queues
          </Link>
        )}
        {isAdmin ? (
          <Link href="/admin" className={linkClass(isAdminRoute && !createJobActive)}>
            Admin
          </Link>
        ) : null}
        {isAdmin ? (
          <Link href="/admin#create-job" className={linkClass(createJobActive)}>
            Create job
          </Link>
        ) : null}
        <button type="button" className={linkClass(false)} onClick={() => router.refresh()}>
          Refresh
        </button>
        <span className="mx-1 hidden h-4 w-px bg-[var(--border)] sm:inline" aria-hidden />
        <form action={logoutAndRedirectToLogin} className="inline">
          <button
            type="submit"
            className="rounded-md px-2 py-1 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
          >
            Sign out
          </button>
        </form>
      </nav>
    </header>
  );
}
