---
name: prisma-database-workflow
description: >-
  Operational Prisma workflow for the Application—edit schema, migrate dev, generate client, seed, reset, db push, and Studio. Use when changing prisma/schema.prisma, fixing migrations, seeding data, or answering how to apply database changes locally or for deployment.
---

# Prisma Database Workflow

Conventions live in `.cursor/rules/database/database-setup.mdc`. This skill is the **step-by-step operator playbook**.

## Edit schema

1. Change models only in `prisma/schema.prisma`.
2. Prefer `@id @default(autoincrement())` unless the project explicitly uses another strategy.
3. Keep relations explicit; align names with domain entities.

## Create migration (normal path)

```bash
npx prisma migrate dev --name <short_descriptive_name>
```

Review `prisma/migrations/<timestamp>_<name>/migration.sql`. Commit schema + migration together.

## Generate client (if needed outside install)

```bash
npx prisma generate
```

Align output with imports (e.g. `@/app/generated/prisma/client` per project).

## Seed

Configure seed in `prisma.config.ts` (`migrations.seed`). Run:

```bash
npx prisma db seed
```

Seed layout: `prisma/seed.ts` orchestrates; domain scripts under `prisma/seeds/**`, raw data under `prisma/seeds/data/**`.

## Reset local DB (destructive)

```bash
npx prisma migrate reset
```

Runs migrations and seed from scratch.

## Fast prototype (dev only)

```bash
npx prisma db push
```

Use when migration history is not the goal; do not rely on this for production drift discipline.

## Inspect data

```bash
npx prisma studio
```

## Production deploy (after CI/CD choice)

Prefer:

```bash
npx prisma migrate deploy
```

against the production `DATABASE_URL`. See `.cursor/skills/production-deploy-checklist/SKILL.md`.

## Related

- Rule: `.cursor/rules/database/database-setup.mdc`
- Skill: `.cursor/skills/bootstrap-dependencies/SKILL.md`
