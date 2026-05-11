import type { WorkflowAlert } from "@/app/lib/definitions";

export function AlertsW({ alerts }: { alerts: WorkflowAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="panel px-4 py-3 text-sm text-[var(--muted)]">
        No active scheduling alerts for this scope.
      </div>
    );
  }

  return (
    <div className="panel divide-y divide-[var(--border)]">
      <div className="px-4 py-3 text-sm font-semibold">Live alerts</div>
      <ul className="max-h-64 overflow-auto">
        {alerts.slice(0, 12).map((a) => (
          <li key={a.id} className="flex items-start gap-3 px-4 py-3 text-sm">
            <span className={a.severity === "CRITICAL" ? "badge badge-crit" : "badge badge-warn"}>
              {a.severity}
            </span>
            <div>
              <div className="font-medium">{a.code}</div>
              <div className="text-[var(--muted)]">{a.message}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
