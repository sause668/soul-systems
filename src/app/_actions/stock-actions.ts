"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/session";
import type { ActionResponse } from "@/app/lib/definitions";
import {
  createStockPart,
  deleteStockPart,
  updateStockPart,
} from "@/lib/workflow/stock-service";

async function adminContext(): Promise<
  | { ok: true; userId: number }
  | { ok: false; error: string }
> {
  const session = await verifySession();
  if (!session) return { ok: false, error: "Unauthorized" };
  if (session.userRole !== "ADMIN") return { ok: false, error: "Forbidden" };
  return { ok: true, userId: Number(session.userId) };
}

function revalidateStockPaths() {
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  revalidatePath("/departments");
}

export async function actionCreateStockPart(input: {
  partNumber: string;
  quantityStocked: number;
}): Promise<ActionResponse<{ stockPartId: number }>> {
  const ctx = await adminContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    const row = await createStockPart({ ...input, actorUserId: ctx.userId });
    revalidateStockPaths();
    return { ok: true, data: { stockPartId: row.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionUpdateStockPart(input: {
  stockPartId: number;
  partNumber: string;
  quantityStocked: number;
}): Promise<ActionResponse> {
  const ctx = await adminContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    await updateStockPart({ ...input, actorUserId: ctx.userId });
    revalidateStockPaths();
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionDeleteStockPart(stockPartId: number): Promise<ActionResponse> {
  const ctx = await adminContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    await deleteStockPart({ stockPartId, actorUserId: ctx.userId });
    revalidateStockPaths();
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
