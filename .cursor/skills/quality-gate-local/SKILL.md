---
name: quality-gate-local
description: >-
  Runs local quality gates before commit or PR—ESLint and production build for the Application. Use when the user asks to verify the project is clean, fix CI-like failures locally, or prepare a merge-ready branch.
---

# Quality Gate (Local)

From repository root:

```bash
npm run lint
npm run build
```

- **lint** — ESLint per `package.json` (`eslint`).
- **build** — `next build`; catches type and route errors many editors miss.

Fix all errors before pushing when possible. If build fails on environment-only issues (missing prod secrets), document the exception; otherwise treat build failures as blocking.

## Optional one-liner

```bash
npm run lint && npm run build
```

## Related

- Skill: `.cursor/skills/local-dev-environment/SKILL.md`
