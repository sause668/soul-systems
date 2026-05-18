import Link from "next/link";

type Dept = { id: number; name: string };

function pillClass(active: boolean) {
  return [
    "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors",
    active
      ? "border-[var(--accent)] bg-[var(--accent-muted)] font-semibold text-[var(--foreground)]"
      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]",
  ].join(" ");
}

export function DepartmentSelector({ departments, selectedId }: { departments: Dept[]; selectedId: number }) {
  return (
    <nav aria-label="Departments" className="flex flex-wrap gap-2">
      {departments.map((d) => (
        <Link key={d.id} href={`/departments?departmentId=${d.id}`} className={pillClass(d.id === selectedId)}>
          {d.name}
        </Link>
      ))}
    </nav>
  );
}
