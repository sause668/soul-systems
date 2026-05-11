import {
  getDepartmentWorkload,
  getJobStatusCounts,
  getThroughputSummary,
} from "@/lib/analytics/metrics";
import { jsonOk } from "@/app/api/v1/_lib/http";
import { requireAdmin } from "@/app/api/v1/_lib/session-route";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const [throughput, statuses, workload] = await Promise.all([
    getThroughputSummary(),
    getJobStatusCounts(),
    getDepartmentWorkload(),
  ]);

  return jsonOk({ throughput, statuses, workload });
}
