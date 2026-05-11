import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/app/lib/definitions";

const COOKIE = "session";
const WEEK = 60 * 60 * 24 * 7;

function getSecretKey(): Uint8Array {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secretKey);
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${WEEK}s`)
    .sign(getSecretKey());
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(
  userId: string,
  userRole: SessionPayload["userRole"],
  userRoleId: string,
): Promise<void> {
  const expiresAt = new Date(Date.now() + WEEK * 1000);
  const session = await encrypt({
    userId,
    userRole,
    userRoleId,
    expiresAt: expiresAt.toISOString(),
  });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return decrypt(token);
}

export async function updateSession(): Promise<void> {
  const payload = await verifySession();
  if (!payload) return;
  await createSession(payload.userId, payload.userRole, payload.userRoleId);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export { COOKIE as SESSION_COOKIE_NAME };
