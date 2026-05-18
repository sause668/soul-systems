"use client";

import { useMemo, useState } from "react";
import type { JobDetailsClientRow } from "@/lib/jobs/job-details-list";

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function rowHaystack(row: JobDetailsClientRow): string {
  const due = new Date(row.dueDate);
  return [
    String(row.jobId),
    row.partNumber,
    String(row.numOfUnits),
    row.departmentName,
    row.statusLabel,
    row.jobStatus,
    due.toISOString(),
    due.toLocaleDateString(),
  ]
    .join(" ")
    .toLowerCase();
}

function rowMatches(row: JobDetailsClientRow, needle: string): boolean {
  return rowHaystack(row).includes(needle);
}

type Props = {
  rows: JobDetailsClientRow[];
  onRowSelect: (row: JobDetailsClientRow) => void;
};

export default function JobDetailsSearchableTable({ rows, onRowSelect }: Props) {
  const [search, setSearch] = useState("");
  const today = useMemo(() => startOfUtcDay(new Date()), []);

  const { displayRows, showNoSearchResults } = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return { displayRows: rows, showNoSearchResults: false };
    }
    const filtered = rows.filter((r) => rowMatches(r, q));
    if (filtered.length === 0) {
      return { displayRows: rows, showNoSearchResults: true };
    }
    return { displayRows: filtered, showNoSearchResults: false };
  }, [rows, search]);

  return (
    <section className="panel overflow-hidden p-0">
      <div className="border-b border-[var(--border)] bg-[var(--background)] px-4 py-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--foreground)]">Search jobs</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job #, part, units, due date, department, status…"
            autoComplete="off"
            className="w-full max-w-md rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </label>
        {showNoSearchResults ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No Search Results</p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">Job #</th>
              <th className="px-3 py-3 font-medium">Part</th>
              <th className="px-3 py-3 font-medium">Units</th>
              <th className="px-3 py-3 font-medium">Due date</th>
              <th className="px-3 py-3 font-medium">Current location</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">
                  No open jobs. Completed work is hidden from this list.
                </td>
              </tr>
            ) : (
              displayRows.map((row) => {
                const due = new Date(row.dueDate);
                const overdue = startOfUtcDay(due) < today;
                return (
                  <tr
                    key={row.jobId}
                    role="button"
                    tabIndex={0}
                    onClick={() => onRowSelect(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowSelect(row);
                      }
                    }}
                    className={[
                      "cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--accent-muted)]/40 focus-visible:bg-[var(--accent-muted)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]",
                      overdue ? "bg-[var(--critical)]/5" : "",
                    ].join(" ")}
                  >
                    <td className="px-3 py-3 font-mono text-xs font-medium">{row.jobId}</td>
                    <td className="px-3 py-3">{row.partNumber}</td>
                    <td className="px-3 py-3">{row.numOfUnits}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={overdue ? "font-semibold text-[var(--critical)]" : undefined}>
                        {due.toLocaleDateString()}
                      </span>
                      {overdue ? (
                        <span className="ml-2 rounded bg-[var(--critical)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--critical)]">
                          Overdue
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">{row.departmentName}</td>
                    <td className="px-3 py-3 text-[var(--foreground)]">{row.statusLabel}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
