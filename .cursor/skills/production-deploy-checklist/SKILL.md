---
name: production-deploy-checklist
description: >-
  Pre-flight checklist for deploying the Application (e.g. Vercel)—production DATABASE_URL, SESSION_SECRET, prisma migrate deploy, build command, and runtime env validation. Use before first production deploy or when production DB/auth/build fails.
---

# Production Deploy Checklist

No substitute for your host’s docs—use this as an Application-specific layer.

## Environment (production)

- [ ] `DATABASE_URL` — production Postgres URL (SSL as required by provider).
- [ ] `SESSION_SECRET` — strong secret; **never** reuse development value.
- [ ] Any OAuth/third-party keys the app uses.

## Database

- [ ] Run migrations against production:

```bash
npx prisma migrate deploy
```

(run in CI or controlled release step with prod `DATABASE_URL`)

## Build

- [ ] Local dry run: `npm run build`.
- [ ] Install uses `postinstall` → `prisma generate` (verify `package.json`).

## App host (e.g. Vercel)

- [ ] Framework preset: Next.js; Node version matches project.
- [ ] Env vars set for **Production** environment.
- [ ] Output: App Router default; no duplicate `BASE_PATH` unless intentional.

## Post-deploy smoke

- [ ] HTTPS login/session cookie works (`secure` cookies require HTTPS).
- [ ] Critical server actions return expected shapes (no leaked stack traces to client).

## Related

- Skill: `.cursor/skills/prisma-database-workflow/SKILL.md`
- Rule: `.cursor/rules/authentication/authentication-setup.mdc`
