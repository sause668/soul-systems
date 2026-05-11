"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  LoginFormSchema,
  SignupFormSchema,
  type ActionResponse,
  type SessionPayload,
} from "@/app/lib/definitions";
import { createSession, deleteSession, verifySession } from "@/app/lib/session";

export async function getSession(): Promise<ActionResponse<SessionPayload>> {
  const session = await verifySession();
  if (!session) return { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" };
  return { ok: true, data: session };
}

export async function getUser(): Promise<
  ActionResponse<{
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: "WORKER" | "ADMIN";
  }>
> {
  const session = await verifySession();
  if (!session) return { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" };

  const user = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
  if (!user) return { ok: false, error: "User not found", code: "NOT_FOUND" };
  return {
    ok: true,
    data: {
      ...user,
      role: user.role === "ADMIN" ? "ADMIN" : "WORKER",
    },
  };
}

export async function getUserById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
}

export async function signupUser(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResponse<{ userId: number }>> {
  const parsed = SignupFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role"),
    departmentName: formData.get("departmentName") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const data = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return { ok: false, error: "Email already registered" };

  const password = await bcrypt.hash(data.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email: data.email,
        username: data.username,
        password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    });

    if (data.role === "ADMIN") {
      await tx.admin.create({ data: { userId: u.id } });
    } else {
      const deptName = data.departmentName?.trim();
      if (!deptName) throw new Error("Workers require a department");
      const dept = await tx.department.findUnique({ where: { name: deptName } });
      if (!dept) throw new Error("Unknown department");
      await tx.worker.create({ data: { userId: u.id, departmentId: dept.id } });
    }

    return u;
  });

  const roleId =
    data.role === "ADMIN"
      ? (await prisma.admin.findFirstOrThrow({ where: { userId: user.id } })).id
      : (await prisma.worker.findFirstOrThrow({ where: { userId: user.id } })).id;

  await createSession(String(user.id), data.role, String(roleId));
  return { ok: true, data: { userId: user.id } };
}

export async function loginUser(
  _prev: unknown,
  formData: FormData,
): Promise<ActionResponse<{ userId: number }>> {
  const parsed = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid credentials" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: {
      admins: { take: 1 },
      workers: { take: 1 },
    },
  });
  if (!user) return { ok: false, error: "Invalid credentials" };

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) return { ok: false, error: "Invalid credentials" };

  const role: SessionPayload["userRole"] = user.role === "ADMIN" ? "ADMIN" : "WORKER";
  let roleId: number;
  if (role === "ADMIN") {
    const admin = user.admins[0];
    if (!admin) return { ok: false, error: "Account is missing an admin profile" };
    roleId = admin.id;
  } else {
    const worker = user.workers[0];
    if (!worker) return { ok: false, error: "Account is missing a worker profile" };
    roleId = worker.id;
  }

  await createSession(String(user.id), role, String(roleId));
  return { ok: true, data: { userId: user.id } };
}

export async function logoutUser(): Promise<void> {
  await deleteSession();
}
