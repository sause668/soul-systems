"use client";

import { useMemo, useState } from "react";
import type { StockListClientRow } from "@/lib/stock/stock-list";

function rowHaystack(row: StockListClientRow): string {
  return [row.partNumber, String(row.quantityStocked), String(row.id)].join(" ").toLowerCase();
}

type Props = {
  rows: StockListClientRow[];
  onRowSelect: (row: StockListClientRow) => void;
};

export default function StockSearchableTable({ rows, onRowSelect }: Props) {
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
          <span className="font-medium text-[var(--foreground)]">Search stock</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Part number, quantity…"
            autoComplete="off"
            className="w-full max-w-md rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </label>
        {showNoSearchResults ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No Search Results</p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">Part number</th>
              <th className="px-3 py-3 font-medium">Quantity in stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-10 text-center text-[var(--muted)]">
                  No parts in inventory. Add a part to track stocked quantities.
                </td>
              </tr>
            ) : (
              displayRows.map((row) => {
                const outOfStock = row.quantityStocked === 0;
                return (
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
                    className={[
                      "cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--accent-muted)]/40 focus-visible:bg-[var(--accent-muted)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]",
                      outOfStock ? "bg-[var(--critical)]/5" : "",
                    ].join(" ")}
                  >
                    <td className="px-3 py-3 font-medium">{row.partNumber}</td>
                    <td className="px-3 py-3">
                      <span className={outOfStock ? "font-semibold text-[var(--critical)]" : undefined}>
                        {row.quantityStocked}
                      </span>
                      {outOfStock ? (
                        <span className="ml-2 rounded bg-[var(--critical)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--critical)]">
                          Out of stock
                        </span>
                      ) : null}
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
