---
name: implement-authentication-flow
description: >-
  Implements or extends the Application's JWT cookie sessions and auth server actions—env, SessionPayload, session.ts encrypt/decrypt/cookies, Zod login/signup schemas in definitions, and user-actions for signup/login/logout/getSession. Use when building auth from scratch, adding a session field, or debugging login/signup flows.
---

# Implement Authentication Flow

Standards: `.cursor/rules/authentication/authentication-setup.mdc`. This skill orders the work.

## 1) Environment

- `SESSION_SECRET` — strong random (e.g. `openssl rand -base64 32`).
- `DATABASE_URL` — required for Prisma-backed user lookup.

## 2) Types and validation (`src/app/lib/definitions.ts`)

- `SessionPayload`: `userId`, `userRole`, `userRoleId`, `expiresAt` (plus JWT fields via `JWTPayload`).
- `LoginFormSchema` / `SignupFormSchema` and corresponding `*FormState` types for server action errors.

## 3) Session helpers (`src/app/lib/session.ts`)

- `encrypt` / `decrypt` with `jose` (HS256, consistent expiry).
- `createSession`, `verifySession`, `updateSession`, `deleteSession`.
- Cookie: `httpOnly`, `secure`, `sameSite: 'lax'`, `path: '/'`, explicit `expires`.

## 4) Server actions (`src/app/**/_actions/user-actions.ts` or domain convention)

- `signupUser` — hash password (`bcryptjs`), create user, `createSession` on success.
- `loginUser` — validate credentials, resolve `userRoleId` from Teacher/Student/Admin relation, `createSession`.
- `logoutUser` — `deleteSession`.
- `getSession` / `getUser` — use `verifySession`; never return `hashedPassword`.

## 5) Security checklist

- Do not trust client-sent roles for authorization; derive from DB + session.
- Validate with Zod before writes.
- Use `select`/`omit` on user queries.

## Related

- Rule: `.cursor/rules/authentication/authentication-setup.mdc`
- Skill: `.cursor/skills/feature-vertical-slice/SKILL.md` for wiring UI later
