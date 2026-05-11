---
name: feature-vertical-slice
description: >-
  Delivers an Application feature end-to-end—folder placement under route groups, shared types/Zod, Prisma if needed, domain server actions, thin page.tsx, feature folder with section components, optional modals and CSS, and cache revalidation. Use when adding a new route, domain screen, or cross-cutting feature that touches DB, actions, and UI together.
---

# Feature Vertical Slice

Apply rules in this **order** (matches `.cursor/rules/application-blueprint.mdc`):

## 1) Directory placement

- Route group under `src/app/(<domain>)/`, `_actions`, `_components`, `_context` if needed.
- See `.cursor/rules/frontend/directory-organization.mdc`.

## 2) Data model (if required)

- Update `prisma/schema.prisma` → migrate → seed if applicable.
- Skill: `.cursor/skills/prisma-database-workflow/SKILL.md`.

## 3) Types and forms

- Extend `src/app/lib/definitions.ts` (and helpers in `grading.ts` / `typeConversion.ts` when relevant).
- Rule: `.cursor/rules/frontend/type-and-domain-lib-organization.mdc`.

## 4) Server actions

- Add or extend `src/app/(domain)/_actions/<entity>-actions.ts`.
- Pattern: `.cursor/rules/frontend/server-action-structure-organization.mdc` (`verifySession`, Zod, `revalidatePath`).

## 5) Page

- Thin `page.tsx`: params, session check, fetch via actions, compose one feature root or role branches.
- Rule: `.cursor/rules/frontend/page-component-structure.mdc`.

## 6) Components

- Feature folder `PascalCase` with root `Feature/Feature.tsx` and section files (`Header.tsx`, …).
- Same rule as above + `.cursor/rules/frontend/directory-organization.mdc`.

## 7) Modals (if needed)

- Colocate under `_components/.../Modals/<Entity>Modals/`.
- Skill: `.cursor/skills/add-feature-modal/SKILL.md`.

## 8) Styling

- Prefer Tailwind + `globals.css` tokens; optional feature `Feature.css`.
- Rule: `.cursor/rules/frontend/css-setup-structure.mdc` — skill: `.cursor/skills/extend-design-tokens/SKILL.md`.

## 9) Layout

- Only change `layout.tsx` when the segment needs providers or shell; root patterns in `.cursor/rules/frontend/layout-structure.mdc`.

## Related

- Blueprint: `.cursor/rules/application-blueprint.mdc`
