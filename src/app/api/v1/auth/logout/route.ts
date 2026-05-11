import { deleteSession } from "@/app/lib/session";
import { jsonOk } from "@/app/api/v1/_lib/http";

export async function POST() {
  await deleteSession();
  return jsonOk({ signedOut: true });
}
