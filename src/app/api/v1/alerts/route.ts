import { computeWorkflowAlerts } from "@/lib/scheduling/alerts";
import { jsonOk } from "@/app/api/v1/_lib/http";
import { requireSession } from "@/app/api/v1/_lib/session-route";

export async function GET(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get("departmentId");
  const alerts = await computeWorkflowAlerts(
    departmentId ? Number(departmentId) : undefined,
  );
  return jsonOk(alerts);
}
