# Modal and form submission test

Analyze **modal-driven flows** (OpenModalComponents, `useModal`, domain `Modals/**`) and **server-action forms** for correctness under stress.

## Cover

1. **Open path** — `OpenModalButton` / `OpenModalTableCell`: correct props passed into modal body; `onModalClose` refreshes or invalidates when needed.
2. **Submit path** — Success closes modal (`closeModal`) and server action runs `revalidatePath` for affected lists/pages.
3. **Failure path** — Validation errors stay in modal; network/action errors do not leave stale global state.
4. **Edge cases** — Submit while pending (`useTransition`); double-click submit; modal closed mid-request; nested modal (if any) does not break focus trap or context.
5. **Security** — Forms only call server actions; no sensitive data in `modalComponent` props beyond what the UI needs.

## Deliverable

- Scenario list with **steps** and **expected behavior**.
- List any **missing** error boundaries or **missing** `revalidatePath` targets after mutation.

Reference `.cursor/rules/frontend/modal-setup-structure.mdc`.
