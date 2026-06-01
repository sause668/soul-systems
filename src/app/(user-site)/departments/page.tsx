import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { prisma } from "@/lib/prisma";
import { DepartmentWorkflowsView } from "@/app/(user-site)/departments/_components/DepartmentWorkflowsView";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ departmentId?: string }>;
}) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }
  if (session.userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (departments.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-[var(--muted)]">
        No departments are configured yet. Add departments in the admin area first.
      </div>
    );
  }

  const requested = Number.parseInt(params.departmentId ?? "", 10);
  const firstId = departments[0]!.id;
  const valid = Number.isFinite(requested) && departments.some((d) => d.id === requested);
  if (!valid) {
    redirect(`/departments?departmentId=${firstId}`);
  }

  const userId = Number(session.userId);

  return (
    <DepartmentWorkflowsView
      userId={userId}
      departments={departments}
      selectedDepartmentId={requested}
    />
  );
}
