"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAndRedirectToLogin } from "@/app/_actions/user-actions";

type Props = {
  isAdmin: boolean;
};

export function DashboardNav({ isAdmin }: Props) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  const title = isAdminRoute ? "Soul Systems · Admin" : "Soul Systems · Floor";

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3">
      <div className="text-sm font-semibold">{title}</div>
      <nav className="flex items-center gap-3 text-sm" aria-label="Account">
        {isAdminRoute ? (
          <Link href="/worker" className="font-semibold text-[var(--accent)]">
            Floor console
          </Link>
        ) : null}
        {!isAdminRoute && isAdmin ? (
          <Link href="/admin" className="font-semibold text-[var(--accent)]">
            Admin overview
          </Link>
        ) : null}
        <form action={logoutAndRedirectToLogin}>
          <button type="submit" className="text-[var(--muted)] hover:text-[var(--foreground)]">
            Sign out
          </button>
        </form>
      </nav>
    </header>
  );
}
