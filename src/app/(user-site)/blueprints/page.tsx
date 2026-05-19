import { redirect } from "next/navigation";
import BlueprintsView from "@/app/(user-site)/blueprints/_components/BlueprintsView";
import { verifySession } from "@/app/lib/session";
import { getBlueprintDetailsMap } from "@/lib/blueprints/blueprint-details-map";
import { getBlueprintFormOptions } from "@/lib/blueprints/blueprint-form-data";
import { getBlueprintList } from "@/lib/blueprints/blueprint-list";

export default async function BlueprintsPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }
  if (session.userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const [rows, detailsById, formOptions] = await Promise.all([
    getBlueprintList(),
    getBlueprintDetailsMap(),
    getBlueprintFormOptions(),
  ]);

  return <BlueprintsView rows={rows} detailsById={detailsById} formOptions={formOptions} />;
}
