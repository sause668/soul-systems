---
name: extend-design-tokens
description: >-
  Extends global styling for the Application—new colors in :root and @theme inline, new next/font faces in fonts.ts, wiring .variable classes on root layout body, Tailwind usage in components, and optional feature-scoped CSS. Use when adding brand colors, typography roles, or migrating inline styles to tokens.
---

# Extend Design Tokens

Rules: `.cursor/rules/frontend/css-setup-structure.mdc`.

## Add or change a color

1. Add semantic variable in `src/app/globals.css` `:root` (e.g. `--accent: #...`).
2. Expose to Tailwind in `@theme inline` as `--color-accent: var(--accent)`.
3. Use in JSX: `bg-accent`, `text-accent`, etc.

## Add or change a font role

1. Register font in `src/app/lib/fonts.ts` with `variable: "--font-<kebab>"`.
2. Map in `@theme inline`, e.g. `--font-callout: var(--font-roboto-flex)`.
3. Append `fontExport.variable` to `<body className={...}>` in `src/app/layout.tsx`.

## Component usage

- Layout/spacing: Tailwind utilities.
- Shared controls: prefer `@layer components` in `globals.css` (`.btn`, `.whiteBox`, form patterns).
- Domain tints (grades, types): `@layer utilities` in `globals.css`; reference by class name from components.

## Feature-only CSS

- Add `Feature.css` beside the feature only when globals are wrong scope; do not redefine theme tokens—use `var(--primary)` etc.

## Related

- Rule: `.cursor/rules/frontend/layout-structure.mdc` (body classes)
- Skill: `.cursor/skills/feature-vertical-slice/SKILL.md`
