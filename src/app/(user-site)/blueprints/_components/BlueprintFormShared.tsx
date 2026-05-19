"use client";

import BlueprintProcessEditor, {
  type ProcessDraft,
} from "@/app/(user-site)/blueprints/_components/BlueprintProcessEditor";
import type { BlueprintFormOptions } from "@/lib/blueprints/blueprint-form-data";
import type { BlueprintDetail } from "@/lib/blueprints/blueprint-detail";

export function detailToProcessDrafts(detail: BlueprintDetail): ProcessDraft[] {
  return detail.processes.map((p) => ({
    key: `pb-${p.id}`,
    id: p.id,
    departmentId: p.departmentId,
    order: p.order,
    processInstructions: p.processInstructions,
    timeEstimatePerUnit: p.timeEstimatePerUnit,
  }));
}

export function validateBlueprintForm(input: {
  partNumber: string;
  timeEstimatePerUnit: number;
  processes: ProcessDraft[];
  customerId?: number;
}): string | null {
  if (input.customerId != null && input.customerId <= 0) return "Select a customer";
  if (!input.partNumber.trim()) return "Part number is required";
  if (input.timeEstimatePerUnit < 0) return "Blueprint time estimate must be non-negative";
  if (input.processes.length === 0) return "Add at least one process step";
  for (let i = 0; i < input.processes.length; i++) {
    const step = input.processes[i];
    if (!step.departmentId) return `Step ${i + 1}: select a department`;
    if (step.timeEstimatePerUnit < 0) return `Step ${i + 1}: time estimate must be non-negative`;
  }
  return null;
}

export function processesToPayload(processes: ProcessDraft[]) {
  return processes.map((p, i) => ({
    id: p.id,
    departmentId: p.departmentId,
    order: i + 1,
    processInstructions: p.processInstructions,
    timeEstimatePerUnit: p.timeEstimatePerUnit,
  }));
}

type BlueprintFieldsProps = {
  partNumber: string;
  timeEstimatePerUnit: number;
  onPartNumberChange: (v: string) => void;
  onTimeEstimateChange: (v: number) => void;
  customerId?: number;
  customers?: BlueprintFormOptions["customers"];
  onCustomerChange?: (id: number) => void;
  customerName?: string;
};

export function BlueprintFields({
  partNumber,
  timeEstimatePerUnit,
  onPartNumberChange,
  onTimeEstimateChange,
  customerId,
  customers,
  onCustomerChange,
  customerName,
}: BlueprintFieldsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      {customers && onCustomerChange ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">Customer</span>
          <select
            value={customerId ?? ""}
            onChange={(e) => onCustomerChange(Number(e.target.value))}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
          >
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      ) : customerName ? (
        <dl className="grid grid-cols-[6rem_1fr] gap-2 text-sm">
          <dt className="text-[var(--muted)]">Customer</dt>
          <dd className="font-medium">{customerName}</dd>
        </dl>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--muted)]">Part number (name)</span>
        <input
          type="text"
          value={partNumber}
          onChange={(e) => onPartNumberChange(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--muted)]">Blueprint est. minutes per unit</span>
        <input
          type="number"
          min={0}
          step={0.1}
          value={timeEstimatePerUnit}
          onChange={(e) => onTimeEstimateChange(Number.parseFloat(e.target.value) || 0)}
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
        />
      </label>
    </div>
  );
}

type ProcessSectionProps = {
  processes: ProcessDraft[];
  departments: BlueprintFormOptions["departments"];
  structureLocked: boolean;
  onProcessesChange: (p: ProcessDraft[]) => void;
};

export function BlueprintProcessSection({
  processes,
  departments,
  structureLocked,
  onProcessesChange,
}: ProcessSectionProps) {
  return (
    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <h3 className="font-semibold text-[var(--foreground)]">Process steps</h3>
      <BlueprintProcessEditor
        processes={processes}
        departments={departments}
        structureLocked={structureLocked}
        onChange={onProcessesChange}
      />
    </div>
  );
}
