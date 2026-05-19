"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/session";
import type { ActionResponse } from "@/app/lib/definitions";
import {
  createBlueprint,
  deleteBlueprint,
  updateBlueprint,
  type ProcessBlueprintInput,
} from "@/lib/workflow/blueprint-service";

async function adminContext(): Promise<
  | { ok: true; userId: number }
  | { ok: false; error: string }
> {
  const session = await verifySession();
  if (!session) return { ok: false, error: "Unauthorized" };
  if (session.userRole !== "ADMIN") return { ok: false, error: "Forbidden" };
  return { ok: true, userId: Number(session.userId) };
}

function revalidateBlueprintPaths() {
  revalidatePath("/blueprints");
  revalidatePath("/dashboard");
  revalidatePath("/jobs");
}

export async function actionCreateBlueprint(input: {
  customerId: number;
  partNumber: string;
  timeEstimatePerUnit: number;
  processes: ProcessBlueprintInput[];
}): Promise<ActionResponse<{ blueprintId: number }>> {
  const ctx = await adminContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    const bp = await createBlueprint({
      ...input,
      actorUserId: ctx.userId,
    });
    revalidateBlueprintPaths();
    return { ok: true, data: { blueprintId: bp.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionUpdateBlueprint(input: {
  blueprintId: number;
  partNumber: string;
  timeEstimatePerUnit: number;
  processes: ProcessBlueprintInput[];
}): Promise<ActionResponse> {
  const ctx = await adminContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    await updateBlueprint({
      ...input,
      actorUserId: ctx.userId,
    });
    revalidateBlueprintPaths();
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionDeleteBlueprint(blueprintId: number): Promise<ActionResponse> {
  const ctx = await adminContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    await deleteBlueprint({ blueprintId, actorUserId: ctx.userId });
    revalidateBlueprintPaths();
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
