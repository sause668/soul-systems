# Application Agent Guide

This repository uses Cursor **rules** (constraints and patterns while editing) and **skills** (step-by-step workflows) as the primary source of truth for AI-assisted implementation.

## Goal

Build and maintain a web application with:

- Next.js App Router (`src/app`)
- Prisma + PostgreSQL (`prisma`, `prisma.config.ts`, `src/lib/prisma.ts`)
- Cookie/JWT auth (`src/app/lib/session.ts`, user actions under `src/app/**/_actions`)
- Server Actions (`src/app/**/_actions`)
- Route-scoped components (`src/app/**/_components`)
- Global styling via Tailwind v4 + `src/app/globals.css`, fonts in `src/app/lib/fonts.ts`, wired in `src/app/layout.tsx`
- Global modals via `ModalProvider` + portal `Modal` in `src/app/(_home)/_context/Modal.tsx`, wired in root `src/app/layout.tsx`, opened with `OpenModalComponents` where possible
- Shared types and Zod forms in `src/app/lib/definitions.ts`; pure grading/behavior/sort helpers in `src/app/lib/grading.ts`; formatting in `src/app/lib/typeConversion.ts`

The concrete repo layout (route groups, domains, file names) follows the reference implementation described in `.cursor/rules/application-blueprint.mdc`; adapt paths when applying these guides to another codebase.

## Rules vs skills

- **Rules** (`.cursor/rules/**/*.mdc`) — Short, enforceable conventions; many use `globs` or `alwaysApply` so they attach to the right files.
- **Skills** (`.cursor/skills/<name>/SKILL.md`) — Procedures, command sequences, and checklists. Load when the user’s task matches the skill description (bootstrap, migrate, deploy, etc.).

Use **both** when applicable: rule keeps outputs consistent; skill walks the steps in order.

## Use order (implementation)

Aligned with `.cursor/rules/application-blueprint.mdc`:

| Step | Rule | Skill (when useful) |
|------|------|------------------------|
| 1 Bootstrap | `setup/install-dependencies.mdc` | `bootstrap-dependencies` |
| 2 Directories | `frontend/directory-organization.mdc` | `feature-vertical-slice` |
| 3 Database | `database/database-setup.mdc` | `prisma-database-workflow` |
| 4 Authentication | `authentication/authentication-setup.mdc` | `implement-authentication-flow` |
| 5 Layouts | `frontend/layout-structure.mdc` | — |
| 6 Server actions | `frontend/server-action-structure-organization.mdc` | `feature-vertical-slice` |
| 7 Pages & components | `frontend/page-component-structure.mdc` | `feature-vertical-slice` |
| 8 Modals | `frontend/modal-setup-structure.mdc` | `add-feature-modal` |
| 9 CSS / Tailwind | `frontend/css-setup-structure.mdc` | `extend-design-tokens` |
| 10 Types / lib | `frontend/type-and-domain-lib-organization.mdc` | — |

**Cross-cutting skills:** `local-dev-environment` (fix local setup), `quality-gate-local` (lint + build), `production-deploy-checklist` (deploy).

## Locations

- **Rules:** `.cursor/rules/` — see `application-blueprint.mdc` for the full index table.
- **Skills:** `.cursor/skills/<skill-name>/SKILL.md` — each folder contains at least `SKILL.md` (optional `scripts/`, `references/`, `assets/` only when needed).
- **Commands:** `.cursor/commands/*.md` — reusable prompts for Composer (type `/`); includes feature, edge-case, auth/session, modal, and security testing workflows.

## Skill catalog

| Skill folder | Use when |
|--------------|----------|
| `bootstrap-dependencies` | From-scratch install, Prisma init, env setup |
| `prisma-database-workflow` | Migrate, seed, reset, Studio, `migrate deploy` |
| `implement-authentication-flow` | Sessions, login, signup, logout pipeline |
| `feature-vertical-slice` | New route/feature touching DB + actions + UI |
| `add-feature-modal` | New modal under `Modals/` + triggers |
| `extend-design-tokens` | Colors, fonts, `@theme`, body classes |
| `local-dev-environment` | `.env`, `prisma generate`, dev server issues |
| `production-deploy-checklist` | Production env + migrate deploy + build |
| `quality-gate-local` | Run lint and build before commit/PR |

## Quick map (task → rule / skill)

| Task | Rule | Skill |
|------|------|-------|
| Overall architecture | `application-blueprint.mdc` | `feature-vertical-slice` |
| npm / install policy | `setup/install-dependencies.mdc` | `bootstrap-dependencies` |
| Folders & components layout | `frontend/directory-organization.mdc` | `feature-vertical-slice` |
| Schema & seeds | `database/database-setup.mdc` | `prisma-database-workflow` |
| Auth backend | `authentication/authentication-setup.mdc` | `implement-authentication-flow` |
| `layout.tsx` | `frontend/layout-structure.mdc` | — |
| `_actions` patterns | `frontend/server-action-structure-organization.mdc` | `feature-vertical-slice` |
| Thin pages / sections | `frontend/page-component-structure.mdc` | `feature-vertical-slice` |
| Global modals | `frontend/modal-setup-structure.mdc` | `add-feature-modal` |
| globals.css / fonts | `frontend/css-setup-structure.mdc` | `extend-design-tokens` |
| definitions / Zod | `frontend/type-and-domain-lib-organization.mdc` | — |
| Local dev broken | — | `local-dev-environment` |
| Pre-push quality | — | `quality-gate-local` |
| Deploy | — | `production-deploy-checklist` |
