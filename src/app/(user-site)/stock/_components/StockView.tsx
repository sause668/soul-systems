import StockClientShell from "@/app/(user-site)/stock/_components/StockClientShell";
import type { StockListRow } from "@/lib/stock/stock-list";

type Props = {
  rows: StockListRow[];
};

export default function StockView({ rows }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Operations</p>
        <h1 className="text-3xl font-semibold">Stock</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Inventory quantities by part number. Update counts here when receiving or adjusting stock; workers see
          these levels when issuing materials on the floor.
        </p>
      </header>

      <StockClientShell rows={rows} />
    </div>
  );
}
