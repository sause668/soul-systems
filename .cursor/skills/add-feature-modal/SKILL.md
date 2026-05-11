---
name: add-feature-modal
description: >-
  Adds or updates an Application modal body using the global ModalProvider—colocated Modals folder, OpenModalButton/OpenModalTableCell triggers, useModal closeModal after server actions, and nested modal patterns. Use when adding a dialog, form overlay, or table-cell modal in any domain route.
---

# Add Feature Modal

Architecture rules: `.cursor/rules/frontend/modal-setup-structure.mdc`.

## Checklist

1. **Root layout** must already wrap with `ModalProvider` and render a single `<Modal />` after `{children}` (`src/app/layout.tsx`).

2. **Create modal component** (Client Component when using hooks):
   - Path: `src/app/(domain)/_components/<Feature>/Modals/<Entity>Modals/<Action><Entity>Modal.tsx`
   - Import `useModal` from `@/app/(_home)/_context/Modal`.
   - On successful mutation, call `closeModal()`.
   - Call domain server actions from `@/app/(domain)/_actions/...`.

3. **Open from UI** — prefer:
   - `OpenModalButton` from `@/app/(_home)/_components/OpenModalComponents/OpenModalButton`
   - `OpenModalTableCell` for tables  
   Pass `modalComponent={<YourModal ... />}`.

4. **Optional `onModalClose`** — set via opener when dismiss needs refresh or cleanup; register before `setModalContent` (handled inside OpenModal helpers).

5. **Revalidation** — mutations inside modals should still `revalidatePath` in server actions for visible lists.

## Related

- Rule: `.cursor/rules/frontend/modal-setup-structure.mdc`
- Skill: `.cursor/skills/feature-vertical-slice/SKILL.md`
