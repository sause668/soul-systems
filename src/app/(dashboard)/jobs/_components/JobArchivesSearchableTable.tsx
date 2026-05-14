"use client";

import { useMemo, useState } from "react";
import type { JobArchiveClientRow } from "@/lib/jobs/job-archives-list";

function rowHaystack(row: JobArchiveClientRow): string {
  const due = new Date(row.dueDate);
  return [
    String(row.jobId),
    row.partNumber,
    row.closingStatus,
    due.toISOString(),
    due.toLocaleDateString(),
  ]
    .join(" ")
    .toLowerCase();
}

function rowMatches(row: JobArchiveClientRow, needle: string): boolean {
  return rowHaystack(row).includes(needle);
}

type Props = {
  rows: JobArchiveClientRow[];
};

export default function JobArchivesSearchableTable({ rows }: Props) {
  const [search, setSearch] = useState("");

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
          <span className="font-medium text-[var(--foreground)]">Search archives</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job #, part, due date, closing status…"
            autoComplete="off"
            className="w-full max-w-md rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </label>
        {showNoSearchResults ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No Search Results</p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">Job #</th>
              <th className="px-3 py-3 font-medium">Part</th>
              <th className="px-3 py-3 font-medium">Due date</th>
              <th className="px-3 py-3 font-medium">Closing status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[var(--muted)]">
                  No completed jobs in the archive yet.
                </td>
              </tr>
            ) : (
              displayRows.map((row) => {
                const due = new Date(row.dueDate);
                const flagged = row.closingStatus !== "—";
                return (
                  <tr
                    key={row.jobId}
                    className={[
                      "border-t border-[var(--border)]",
                      flagged ? "bg-[var(--critical)]/5" : "",
                    ].join(" ")}
                  >
                    <td className="px-3 py-3 font-mono text-xs font-medium">{row.jobId}</td>
                    <td className="px-3 py-3">{row.partNumber}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{due.toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-[var(--foreground)]">
                      {row.closingStatus === "—" ? (
                        <span className="text-[var(--muted)]">—</span>
                      ) : (
                        <span
                          className={
                            row.closingStatus === "Completed overdue"
                              ? "font-medium text-[var(--critical)]"
                              : "font-medium text-[var(--foreground)]"
                          }
                        >
                          {row.closingStatus}
                        </span>
                      )}
                    </td>
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
