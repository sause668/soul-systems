import { verifySession } from "@/app/lib/session";
import { jsonError } from "@/app/api/v1/_lib/http";

export async function requireSession() {
  const session = await verifySession();
  if (!session) {
    return { ok: false as const, response: jsonError("Unauthorized", 401, "UNAUTHORIZED") };
  }
  return { ok: true as const, session };
}

export async function requireAdmin() {
  const gate = await requireSession();
  if (!gate.ok) return gate;
  if (gate.session.userRole !== "ADMIN") {
    return { ok: false as const, response: jsonError("Forbidden", 403, "FORBIDDEN") };
  }
  return gate;
}
