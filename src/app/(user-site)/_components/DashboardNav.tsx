"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAndRedirectToLogin } from "@/app/_actions/user-actions";

type Props = {
  isAdmin: boolean;
  departmentLabel?: string;
};

function linkClass(active: boolean) {
  return [
    "rounded-md px-2 py-1 transition-colors",
    active
      ? "bg-[var(--accent-muted)] font-semibold text-[var(--foreground)]"
      : "text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]",
  ].join(" ");
}

export function DashboardNav({ isAdmin, departmentLabel }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomeRoute = pathname === "/dashboard" || pathname === "/dashboard/";
  const isDepartmentsRoute = pathname.startsWith("/departments");
  const isJobsRoute = pathname.startsWith("/jobs");

  const contextLabel = isAdmin
    ? isHomeRoute
      ? "Home"
      : isDepartmentsRoute
        ? "Workflows"
        : isJobsRoute
          ? pathname.startsWith("/jobs/archives")
            ? "Job Archives"
            : "Job Details"
          : "Home"
    : departmentLabel ?? "Department";

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <Link
          href="/dashboard"
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
        <Link href="/dashboard" className={linkClass(isHomeRoute)}>
          Home
        </Link>
        {isAdmin ? (
          <Link href="/departments" className={linkClass(isDepartmentsRoute)}>
            Workflows
          </Link>
        ) : (
          <Link href="/dashboard#queues" className={linkClass(isHomeRoute)}>
            Queues
          </Link>
        )}
        {isAdmin ? (
          <Link
            href="/jobs"
            className={linkClass(isJobsRoute && !pathname.startsWith("/jobs/archives"))}
          >
            Job details
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
