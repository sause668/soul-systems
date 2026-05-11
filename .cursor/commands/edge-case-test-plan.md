# Edge case test plan

Produce an **edge-case and failure-mode test matrix** for the selected feature, server actions, or API surface.

## Categories to cover

1. **Input validation** — Empty strings, whitespace-only, wrong types, out-of-range numbers, malformed dates/IDs, Unicode and very long strings.
2. **Identifiers** — Missing or wrong `courseId`, `studentId`, `assignmentId`; zero/negative IDs; non-numeric path params; IDs that do not exist or belong to another tenant/course (cross-user access).
3. **Auth/session** — No cookie, expired/invalid JWT, valid session but wrong role for the action.
4. **Concurrency / ordering** — Double-submit form, rapid modal open/close, stale props after mutation (does `revalidatePath` cover the right routes?).
5. **Database** — Unique constraint violations, cascade deletes, empty `findMany` results, partial failures mid-transaction (where applicable).
6. **UI** — Loading and error boundaries (`loading.tsx`, `error.tsx`), empty tables/lists, mobile vs desktop layouts if the feature is responsive.

## Output format

- Table or bullet matrix: **Condition** | **Expected behavior** (user-visible + server) | **Risk if wrong**.
- End with **prioritized retest list** (P0/P1) for manual QA.

Reference **Zod schemas** in `@/app/lib/definitions` and **action return types** (`ActionResponse`, `*FormState`, `Error`) when reviewing server actions.
