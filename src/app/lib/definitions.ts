import type { JWTPayload } from "jose";
import { z } from "zod";

export type ActionResponse<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export type SessionPayload = JWTPayload & {
  userId: string;
  userRole: "WORKER" | "ADMIN";
  userRoleId: string;
  expiresAt: string;
};

export const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignupFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  username: z.string().min(2).max(64),
  firstName: z.string().min(1).max(120),
  lastName: z.string().min(1).max(120),
  role: z.enum(["WORKER", "ADMIN"]),
  departmentName: z.string().optional(),
});

export type LoginFormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

export type SignupFormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

export type AlertSeverity = "WARNING" | "CRITICAL";

export type WorkflowAlert = {
  id: string;
  severity: AlertSeverity;
  code: string;
  message: string;
  departmentId?: number;
  departmentName?: string;
  jobId?: number;
  processId?: number;
};
