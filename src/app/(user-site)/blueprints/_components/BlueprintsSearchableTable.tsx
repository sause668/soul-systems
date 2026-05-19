"use client";

import { useMemo, useState } from "react";
import type { BlueprintListClientRow } from "@/lib/blueprints/blueprint-list";

function rowHaystack(row: BlueprintListClientRow): string {
  return [
    row.partNumber,
    row.customerName,
    String(row.processCount),
    String(row.jobsCount),
  ]
    .join(" ")
    .toLowerCase();
}

type Props = {
  rows: BlueprintListClientRow[];
  onRowSelect: (row: BlueprintListClientRow) => void;
};

export default function BlueprintsSearchableTable({ rows, onRowSelect }: Props) {
  const [search, setSearch] = useState("");

  const { displayRows, showNoSearchResults } = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return { displayRows: rows, showNoSearchResults: false };
    }
    const filtered = rows.filter((r) => rowHaystack(r).includes(q));
    if (filtered.length === 0) {
      return { displayRows: rows, showNoSearchResults: true };
    }
    return { displayRows: filtered, showNoSearchResults: false };
  }, [rows, search]);

  return (
    <section className="panel overflow-hidden p-0">
      <div className="border-b border-[var(--border)] bg-[var(--background)] px-4 py-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--foreground)]">Search blueprints</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Part number, customer, process count…"
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
              <th className="px-3 py-3 font-medium">Name (part #)</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Processes</th>
              <th className="px-3 py-3 font-medium">Frequency of use</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[var(--muted)]">
                  No blueprints yet. Create one to define manufacturing steps for a part.
                </td>
              </tr>
            ) : (
              displayRows.map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onRowSelect(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowSelect(row);
                    }
                  }}
                  className="cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--accent-muted)]/40 focus-visible:bg-[var(--accent-muted)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
                >
                  <td className="px-3 py-3 font-medium">{row.partNumber}</td>
                  <td className="px-3 py-3">{row.customerName}</td>
                  <td className="px-3 py-3">{row.processCount}</td>
                  <td className="px-3 py-3">
                    {row.jobsCount === 0 ? (
                      <span className="text-[var(--muted)]">Never used</span>
                    ) : (
                      <span>
                        {row.jobsCount} job{row.jobsCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
