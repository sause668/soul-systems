# Feature test plan

Generate a **structured feature test plan** for the current task or selected code (routes, server actions, components).

## Scope

- Identify **user-visible behavior** and **server-side effects** (DB writes, cache revalidation, emails, etc.).
- Map **happy paths** for each role that should access the feature (e.g. teacher vs student vs admin, or public vs authenticated).
- List **integration points**: `page.tsx` data loading, `_actions` mutations, `_components` triggers (buttons, forms, modals).

## Output format

1. **Objective** — One sentence on what “working correctly” means.
2. **Preconditions** — Auth/session, seed data, env (e.g. `DATABASE_URL`).
3. **Test scenarios** — Numbered steps: action → expected UI → expected DB/cache outcome.
4. ** Regression hooks ** — What existing flows must still work after this change.
5. ** Manual vs automated ** — Suggest what could be covered by `npm run lint`, `npm run build`, and what needs browser or DB verification.

## Constraints

- Align with project rules: server actions in `_actions`, session via `@/app/lib/session`, Prisma via `@/lib/prisma`.
- Do not assume tests exist; if proposing Playwright/E2E, mark as **optional follow-up**.

When the user names a specific route or PR scope, anchor scenarios to **file paths** and **URLs**.
