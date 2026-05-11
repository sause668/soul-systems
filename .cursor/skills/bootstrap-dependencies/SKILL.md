---
name: bootstrap-dependencies
description: >-
  Runs the full dependency and toolchain bootstrap for Application from scratch or a clean clone—npm installs, Prisma init, env keys, prisma.config seed wiring, and daily scripts. Use when onboarding a new machine, recreating the project, or when the user asks how to install or set up dependencies.
---

# Bootstrap Dependencies

Follow `.cursor/rules/setup/install-dependencies.mdc` for policy (prefer `npm`). Execute this workflow for a **from-scratch** or **new contributor** setup.

## New Next.js app (greenfield only)

```bash
npx create-next-app@latest <project-name>
```

Use: TypeScript, ESLint, **No** React Compiler, Tailwind CSS, **`src/`** directory, App Router.

## Runtime packages

```bash
npm install @prisma/client @prisma/adapter-pg bcryptjs dotenv jose pg react-icons react-responsive zod
```

## Dev packages

```bash
npm install --save-dev prisma tsx @types/pg
```

## Prisma init (align with repo conventions)

```bash
npx prisma init --db --output @/app/generated/prisma
```

Use Prisma v7.x. Complete provider prompts (login/DB) as directed. Prefer the project folder name matching the repo root name.

## Environment

1. Set `DATABASE_URL` in `.env` after the database exists.
2. Add `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

3. In `prisma.config.ts`, ensure `migrations.seed` points at the seed runner, e.g. `'tsx prisma/seed.ts'` (match existing project).

## After env is valid

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Or follow `.cursor/skills/prisma-database-workflow/SKILL.md` for ongoing schema work.

## Install and generate (existing clone)

```bash
npm install
```

`postinstall` runs `prisma generate` per `package.json`.

## Daily commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Related

- Rules: `.cursor/rules/setup/install-dependencies.mdc`, `.cursor/rules/database/database-setup.mdc`
- Skill: `.cursor/skills/prisma-database-workflow/SKILL.md`
