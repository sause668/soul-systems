"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/session";
import { prisma } from "@/lib/prisma";
import {
  adminOverrideProcess,
  completeProcess,
  createJobFromBlueprint,
  deleteJob,
  recordMaterialIssue,
  updateJobDueAndUnits,
} from "@/lib/workflow/job-service";
import type { ActionResponse } from "@/app/lib/definitions";

async function authContext(): Promise<
  | { ok: true; userId: number; isAdmin: boolean }
  | { ok: false; error: string }
> {
  const session = await verifySession();
  if (!session) return { ok: false, error: "Unauthorized" };
  return {
    ok: true,
    userId: Number(session.userId),
    isAdmin: session.userRole === "ADMIN",
  };
}

export async function actionCompleteProcess(processId: number): Promise<ActionResponse> {
  const ctx = await authContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    await completeProcess({ processId, userId: ctx.userId, isAdmin: ctx.isAdmin });
    revalidatePath("/worker");
    revalidatePath("/departments");
    revalidatePath("/admin");
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionIssueMaterial(input: {
  processId: number;
  partNumber: string;
  quantityIssued: number;
}): Promise<ActionResponse> {
  const ctx = await authContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    await recordMaterialIssue({
      processId: input.processId,
      userId: ctx.userId,
      isAdmin: ctx.isAdmin,
      partNumber: input.partNumber,
      quantityIssued: input.quantityIssued,
    });
    revalidatePath("/worker");
    revalidatePath("/departments");
    revalidatePath("/admin");
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionCreateJob(input: {
  blueprintId: number;
  numOfUnits: number;
  dueDate: string;
}): Promise<ActionResponse<{ jobId: number }>> {
  const ctx = await authContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!ctx.isAdmin) return { ok: false, error: "Forbidden" };
  try {
    const job = await createJobFromBlueprint({
      blueprintId: input.blueprintId,
      numOfUnits: input.numOfUnits,
      dueDate: new Date(input.dueDate),
      actorUserId: ctx.userId,
    });
    revalidatePath("/admin");
    revalidatePath("/departments");
    revalidatePath("/jobs");
    return { ok: true, data: { jobId: job.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionUpdateJob(input: {
  jobId: number;
  dueDate: string;
  numOfUnits: number;
}): Promise<ActionResponse> {
  const ctx = await authContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!ctx.isAdmin) return { ok: false, error: "Forbidden" };
  try {
    await updateJobDueAndUnits({
      jobId: input.jobId,
      dueDate: new Date(input.dueDate),
      numOfUnits: input.numOfUnits,
      actorUserId: ctx.userId,
    });
    revalidatePath("/admin");
    revalidatePath("/departments");
    revalidatePath("/worker");
    revalidatePath("/jobs");
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionDeleteJob(jobId: number): Promise<ActionResponse> {
  const ctx = await authContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!ctx.isAdmin) return { ok: false, error: "Forbidden" };
  try {
    await deleteJob({ jobId, actorUserId: ctx.userId });
    revalidatePath("/admin");
    revalidatePath("/departments");
    revalidatePath("/worker");
    revalidatePath("/jobs");
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function actionOverrideProcess(
  processId: number,
  status: "QUEUED" | "ACTIVE" | "COMPLETED" | "SKIPPED",
): Promise<ActionResponse> {
  const ctx = await authContext();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!ctx.isAdmin) return { ok: false, error: "Forbidden" };
  try {
    await adminOverrideProcess({ processId, userId: ctx.userId, status });
    revalidatePath("/admin");
    revalidatePath("/worker");
    revalidatePath("/departments");
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function getWorkerDepartmentIds(userId: number): Promise<number[]> {
  const rows = await prisma.worker.findMany({ where: { userId }, select: { departmentId: true } });
  return rows.map((r) => r.departmentId);
}
