---
name: local-dev-environment
description: >-
  Verifies a working local dev environment for the Application—.env variables, npm install, prisma generate/migrate, and starting Next.js. Use when the app fails to start, Prisma client is stale, or onboarding a developer on local setup (without redoing full bootstrap).
---

# Local Dev Environment

## Required env

- `DATABASE_URL` — PostgreSQL connection string.
- `SESSION_SECRET` — non-empty secret for JWT signing.

## Quick verify

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

If schema matches DB but client errors persist:

```bash
npx prisma generate
```

## Common fixes

- **Prisma Client outdated** — run `npm install` or `npx prisma generate` after schema/pull changes.
- **Migration drift** — `npx prisma migrate dev` on latest branch.
- **Empty DB** — `npx prisma db seed` (see `prisma.config.ts`).

## Related

- Skill: `.cursor/skills/bootstrap-dependencies/SKILL.md`
- Skill: `.cursor/skills/prisma-database-workflow/SKILL.md`
