"use client";

import type { BlueprintFormOptions } from "@/lib/blueprints/blueprint-form-data";

export type ProcessDraft = {
  key: string;
  id?: number;
  departmentId: number;
  order: number;
  processInstructions: string;
  timeEstimatePerUnit: number;
};

type Props = {
  processes: ProcessDraft[];
  departments: BlueprintFormOptions["departments"];
  structureLocked: boolean;
  onChange: (processes: ProcessDraft[]) => void;
};

function newProcess(order: number): ProcessDraft {
  return {
    key: `new-${Date.now()}-${Math.random()}`,
    departmentId: 0,
    order,
    processInstructions: "",
    timeEstimatePerUnit: 0,
  };
}

export default function BlueprintProcessEditor({
  processes,
  departments,
  structureLocked,
  onChange,
}: Props) {
  const update = (index: number, patch: Partial<ProcessDraft>) => {
    const next = processes.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onChange(next);
  };

  const remove = (index: number) => {
    const next = processes
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, order: i + 1 }));
    onChange(next);
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= processes.length) return;
    const next = [...processes];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next.map((p, i) => ({ ...p, order: i + 1 })));
  };

  const add = () => {
    onChange([...processes, newProcess(processes.length + 1)]);
  };

  return (
    <div className="space-y-3">
      {structureLocked ? (
        <p className="text-xs text-[var(--muted)]">
          Jobs use this blueprint — you can edit instructions, departments, and time estimates, but not add or
          remove steps.
        </p>
      ) : null}

      {processes.map((step, index) => (
        <div
          key={step.key}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--muted)]">Step {index + 1}</span>
            {!structureLocked ? (
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded border border-[var(--border)] px-2 py-0.5 text-xs disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={index === processes.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded border border-[var(--border)] px-2 py-0.5 text-xs disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  disabled={processes.length <= 1}
                  onClick={() => remove(index)}
                  className="rounded border border-[var(--critical)] px-2 py-0.5 text-xs text-[var(--critical)] disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Department</span>
            <select
              value={step.departmentId || ""}
              onChange={(e) => update(index, { departmentId: Number(e.target.value) })}
              className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
            >
              <option value="">Select department…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Instructions</span>
            <textarea
              value={step.processInstructions}
              onChange={(e) => update(index, { processInstructions: e.target.value })}
              rows={2}
              className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--muted)]">Est. minutes per unit</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={step.timeEstimatePerUnit}
              onChange={(e) =>
                update(index, { timeEstimatePerUnit: Number.parseFloat(e.target.value) || 0 })
              }
              className="rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
            />
          </label>
        </div>
      ))}

      {!structureLocked ? (
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-dashed border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--border)]/50"
        >
          Add process step
        </button>
      ) : null}
    </div>
  );
}
