import { computeWorkflowAlerts } from "@/lib/scheduling/alerts";
import {
  getDepartmentWorkload,
  getJobStatusCounts,
  getThroughputSummary,
} from "@/lib/analytics/metrics";
import { prisma } from "@/lib/prisma";
import { AlertsW } from "@/app/(dashboard)/worker/_components/AlertsW";
import { LiveRefresh } from "@/app/(dashboard)/worker/_components/LiveRefresh";
import AdminHomeDepartmentWorkloadSection from "./AdminHomeDepartmentWorkloadSection";
import AdminHomeHeader from "./AdminHomeHeader";
import AdminHomeHotJobsSection from "./AdminHomeHotJobsSection";
import AdminHomeMetricsSection from "./AdminHomeMetricsSection";

export async function AdminHome() {
  const [alerts, throughput, statuses, workload, jobs] = await Promise.all([
    computeWorkflowAlerts(),
    getThroughputSummary(),
    getJobStatusCounts(),
    getDepartmentWorkload(),
    prisma.job.findMany({
      where: { status: { not: "COMPLETED" } },
      take: 15,
      orderBy: [{ dueDate: "asc" }, { id: "asc" }],
      include: { blueprint: true, processes: { select: { id: true, status: true, departmentId: true } } },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <LiveRefresh />
      <AdminHomeHeader />
      <AdminHomeMetricsSection throughput={throughput} statuses={statuses} />
      <AlertsW alerts={alerts} />
      <AdminHomeDepartmentWorkloadSection workload={workload} />
      <AdminHomeHotJobsSection jobs={jobs} />
    </div>
  );
}
