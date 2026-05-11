# AuthZ and session review

Deep dive on **authorization and session handling** for the chosen routes, layouts, or `_actions` files.

## Questions to answer

1. Where is **`verifySession()`** (or equivalent) called for each mutation and sensitive read?
2. Is **`userRole` / `userRoleId`** derived from the **database** after session lookup, never from hidden form fields or client-only props?
3. For course/student/grade mutations: does the code verify the acting user **owns or teaches** that resource (e.g. teacher matches course, student only sees self)?
4. Can any server action be invoked with **another user’s IDs** from the client (IDOR)? List attack scenarios and whether server checks prevent them.
5. Do **public routes** (`Landing`, unauthenticated pages) leak data or allow actions that should require login?
6. After logout, are **cached client state** or **parallel tabs** considered (document only; optional hardening suggestions)?

## Output

- **Gap list**: Missing or weak checks with **concrete code references**.
- **Recommended fixes**: Minimal code changes (guards, extra Prisma `where` clauses, shared `assertCourseTeacher(session, courseId)` helpers).
- **Test ideas**: Specific edge-case tests from `@authz-session-review` perspective.

Align with `.cursor/rules/authentication/authentication-setup.mdc` and server-action patterns in `frontend/server-action-structure-organization.mdc`.
