import { prisma } from "@/lib/prisma";
import { actionCreateJob } from "@/app/_actions/manufacturing-actions";

async function createJob(formData: FormData) {
  "use server";
  const blueprintId = Number(formData.get("blueprintId"));
  const numOfUnits = Number(formData.get("numOfUnits"));
  const dueDate = String(formData.get("dueDate"));
  const res = await actionCreateJob({ blueprintId, numOfUnits, dueDate });
  if (!res.ok) {
    throw new Error(res.error);
  }
}

export async function CreateJobFormA() {
  const blueprints = await prisma.blueprint.findMany({
    orderBy: { partNumber: "asc" },
    select: { id: true, partNumber: true, timeEstimatePerUnit: true },
    take: 50,
  });

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 21);
  const dueValue = defaultDue.toISOString().slice(0, 10);

  return (
    <form action={createJob} className="panel flex flex-col gap-3 p-4 text-sm">
      <div className="font-semibold">Create job</div>
      <label className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Blueprint</span>
        <select
          name="blueprintId"
          className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2"
          required
        >
          {blueprints.map((b) => (
            <option key={b.id} value={b.id}>
              {b.partNumber} (~{b.timeEstimatePerUnit} min / unit)
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Units</span>
        <input
          name="numOfUnits"
          type="number"
          min={1}
          defaultValue={1}
          className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Due date</span>
        <input
          name="dueDate"
          type="date"
          defaultValue={dueValue}
          className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2"
          required
        />
      </label>
      <button type="submit" className="mt-2 rounded-md bg-[var(--accent)] px-3 py-2 font-semibold text-white">
        Instantiate workflow
      </button>
    </form>
  );
}
