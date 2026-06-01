"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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

function menuLinkClass(active: boolean) {
  return [
    "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
    active
      ? "bg-[var(--accent-muted)] font-semibold text-[var(--foreground)]"
      : "text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]",
  ].join(" ");
}

export function DashboardNav({ isAdmin, departmentLabel }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHomeRoute = pathname === "/dashboard" || pathname === "/dashboard/";
  const isDepartmentsRoute = pathname.startsWith("/departments");
  const isJobsRoute = pathname.startsWith("/jobs");
  const isBlueprintsRoute = pathname.startsWith("/blueprints");
  const isStockRoute = pathname.startsWith("/stock");
  const isJobDetailsRoute = isJobsRoute && !pathname.startsWith("/jobs/archives");

  const contextLabel = isAdmin
    ? isHomeRoute
      ? "Home"
      : isDepartmentsRoute
        ? "Workflows"
        : isStockRoute
          ? "Stock"
          : isBlueprintsRoute
            ? "Blueprints"
            : isJobsRoute
              ? pathname.startsWith("/jobs/archives")
                ? "Job Archives"
                : "Job Details"
              : "Home"
    : departmentLabel ?? "Department";

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  const navLinks = (
    <>
      <Link href="/dashboard" className={linkClass(isHomeRoute)} onClick={closeMenu}>
        Home
      </Link>
      {isAdmin ? (
        <Link href="/departments" className={linkClass(isDepartmentsRoute)} onClick={closeMenu}>
          Workflows
        </Link>
      ) : (
        <Link href="/dashboard#queues" className={linkClass(isHomeRoute)} onClick={closeMenu}>
          Queues
        </Link>
      )}
      {isAdmin ? (
        <Link href="/jobs" className={linkClass(isJobDetailsRoute)} onClick={closeMenu}>
          Job details
        </Link>
      ) : null}
      {isAdmin ? (
        <Link href="/blueprints" className={linkClass(isBlueprintsRoute)} onClick={closeMenu}>
          Blueprints
        </Link>
      ) : null}
      {isAdmin ? (
        <Link href="/stock" className={linkClass(isStockRoute)} onClick={closeMenu}>
          Stock
        </Link>
      ) : null}
      <button
        type="button"
        className={linkClass(false)}
        onClick={() => {
          closeMenu();
          router.refresh();
        }}
      >
        Refresh
      </button>
    </>
  );

  const menuLinks = (
    <>
      <Link href="/dashboard" className={menuLinkClass(isHomeRoute)} onClick={closeMenu}>
        Home
      </Link>
      {isAdmin ? (
        <Link href="/departments" className={menuLinkClass(isDepartmentsRoute)} onClick={closeMenu}>
          Workflows
        </Link>
      ) : (
        <Link href="/dashboard#queues" className={menuLinkClass(isHomeRoute)} onClick={closeMenu}>
          Queues
        </Link>
      )}
      {isAdmin ? (
        <Link href="/jobs" className={menuLinkClass(isJobDetailsRoute)} onClick={closeMenu}>
          Job details
        </Link>
      ) : null}
      {isAdmin ? (
        <Link href="/blueprints" className={menuLinkClass(isBlueprintsRoute)} onClick={closeMenu}>
          Blueprints
        </Link>
      ) : null}
      {isAdmin ? (
        <Link href="/stock" className={menuLinkClass(isStockRoute)} onClick={closeMenu}>
          Stock
        </Link>
      ) : null}
      <button
        type="button"
        className={menuLinkClass(false)}
        onClick={() => {
          closeMenu();
          router.refresh();
        }}
      >
        Refresh
      </button>
      <div className="my-1 border-t border-[var(--border)]" role="separator" />
      <form action={logoutAndRedirectToLogin} className="block">
        <button
          type="submit"
          className={menuLinkClass(false)}
          onClick={closeMenu}
        >
          Sign out
        </button>
      </form>
    </>
  );

  return (
    <header className="relative flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
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
        <span className="truncate text-xs font-medium text-[var(--muted)]">{contextLabel}</span>
      </div>

      <div ref={menuRef} className="relative md:hidden">
        <button
          type="button"
          className="rounded-md border border-[var(--border)] p-2 text-[var(--foreground)] hover:bg-[var(--border)]"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-haspopup="true"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {menuOpen ? (
          <nav
            id={menuId}
            className="absolute right-0 top-full z-50 mt-1 min-w-[12rem] rounded-lg border border-[var(--border)] bg-[var(--panel)] p-1 shadow-lg"
            aria-label="Primary"
          >
            {menuLinks}
          </nav>
        ) : null}
      </div>

      <nav
        className="hidden items-center gap-1 text-sm md:flex md:gap-2"
        aria-label="Primary"
      >
        {navLinks}
        <span className="mx-1 hidden h-4 w-px bg-[var(--border)] lg:inline" aria-hidden />
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
