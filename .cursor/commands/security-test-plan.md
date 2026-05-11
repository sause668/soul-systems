# Security test plan

Run a **targeted security review** of the selected files or feature area for this stack (Next.js App Router, Server Actions, Prisma, JWT cookie sessions).

## Checklist (investigate and report)

1. **Secrets and config** — No secrets in client bundles, logs, or repo; `SESSION_SECRET` and `DATABASE_URL` only on server; `.env` not committed.
2. **Authentication** — Session creation only after verified credentials; password hashing (e.g. bcrypt); no timing leaks called out if relevant.
3. **Authorization** — Every sensitive server action verifies session (`verifySession`) and **enforces role/course ownership in code**, not UI alone; no IDOR (user A cannot mutate user B’s entities by changing IDs).
4. **Input validation** — All mutable inputs validated with Zod (or equivalent) before Prisma; reject unexpected fields.
5. **Injection** — Prisma parameterized queries only; no raw SQL with string concatenation from user input.
6. **XSS** — User-controlled strings rendered in React without dangerous `dangerouslySetInnerHTML`; sanitize if rich HTML exists.
7. **CSRF** — Server Actions use POST semantics; cookies `SameSite` appropriate (project uses `lax`); note any cross-site scenarios.
8. **Cookies** — Session cookie `httpOnly`, `secure` in production, sensible path and expiry.
9. **Error disclosure** — Errors to client are generic; stack traces and DB details not leaked to end users.

## Output format

- **Findings**: Severity (Critical / High / Medium / Low), file path, issue, **remediation**.
- **Residual risks**: What was not fully verifiable without runtime scans or pentest tools.

Stay evidence-based: cite **specific lines or patterns** when possible.
