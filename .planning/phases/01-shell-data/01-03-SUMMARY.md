---
phase: 01-shell-data
plan: "03"
subsystem: ui
tags: [react, zustand, tailwind, typescript, payments, store-wiring]

# Dependency graph
requires:
  - 01-01 (PaymentsSection stub + PoweredByJuspay component)
  - 01-02 (useVaultStore with cards, reset action, localStorage persistence)
provides:
  - PaymentsSection wired to useVaultStore: live card list + Reset demo button
  - DATA-03: Reset demo action surfaced in the UI and restores seeded state
affects: [02-payments, 03-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useVaultStore selector pattern: useVaultStore((s) => s.cards) and useVaultStore((s) => s.reset)"
    - "Card row UI: color swatch (inline backgroundColor) + label + maskedNumber + status badge (pill)"
    - "Reset demo button: bordered rounded-full pill at section bottom, calls store reset()"

key-files:
  created: []
  modified:
    - src/sections/PaymentsSection.tsx

key-decisions:
  - "Selector-per-field pattern used (not destructure) — avoids unnecessary re-renders on unrelated store changes"
  - "Status badge uses Tailwind color classes (not inline style) — active=green-50/green-700, frozen=gray-100/gray-500"
  - "Card color swatch uses inline style (backgroundColor: card.color) — dynamic hex from seed data, Tailwind JIT cannot handle it"

requirements-completed: [DATA-03]

# Metrics
duration: 2min
completed: 2026-06-09
---

# Phase 01 Plan 03: Payments Store Wiring Summary

**PaymentsSection replaced from static stub to store-driven card list using useVaultStore selectors, with color-coded card rows and a Reset demo button that restores seeded state via store reset()**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-09T06:49:00Z
- **Completed:** 2026-06-09T06:51:18Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced static stub body in PaymentsSection.tsx with live store-driven implementation
- Cards rendered from `useVaultStore((s) => s.cards)` — zero hardcoded card data
- Each card row: color swatch (inline style), label, maskedNumber (gray), status badge (active = green pill, frozen = gray pill)
- Empty state: "No cards yet." shown when cards.length === 0
- "Reset demo" button (bordered rounded-full pill) calls `useVaultStore((s) => s.reset)` on click
- Helper text "Restore the original seeded demo data." placed near the button
- PoweredByJuspay co-brand mark retained at section bottom
- `npm run build` exits 0 (single file change, TypeScript clean)

## End-to-End Proof

Phase 1 foundation is now fully connected:
- **Shell (01-01):** Settings modal with Payments nav item routing to PaymentsSection
- **Data layer (01-02):** useVaultStore with seeded cards, persistence, updateCard/reset actions
- **Store wiring (01-03):** PaymentsSection reads live store state, surfaces Reset demo

Persistence is proven: store changes survive page refresh; Reset demo restores seeded state across refresh.

## Task Commits

1. **Task 1: Wire PaymentsSection to useVaultStore** — `7863bea` (feat)

## Files Modified

- `src/sections/PaymentsSection.tsx` — static stub replaced with store-driven minimal Payments pane

## Decisions Made

- **Selector-per-field pattern** — `useVaultStore((s) => s.cards)` and `useVaultStore((s) => s.reset)` called separately to avoid re-renders when unrelated store slices change
- **Card color swatch uses inline style** — same pattern established in 01-01 for Toggle; Tailwind JIT cannot generate classes for dynamic hex values (card.color from seed data)
- **Status badge uses Tailwind classes** — "active" and "frozen" are finite, known values so static Tailwind classes are appropriate here

## Deviations from Plan

None — plan executed exactly as written. Single task, single file, build passed first try.

## Known Stubs

- Card list is intentionally minimal (label + maskedNumber + status badge only). Full card-management UI (limit bars, MFA toggles, edit/freeze controls) is Phase 2 scope.
- PlaceholderSection for non-Payments sections remains (out of scope per PROJECT.md).

## Next Phase Readiness

- **Phase 2 (02-payments):** PaymentsSection is the entry point for the full card management UI. Phase 2 replaces this minimal list with card creation, limit editing, MFA toggles, and the simulate-payment flow.
- Store API (useVaultStore: cards, updateCard, addCard, removeCard, addTransaction, reset) is stable and ready for Phase 2 consumers.
- All Phase 1 success criteria met: shell + nav + data layer + persistence connected and working end to end.

---
*Phase: 01-shell-data*
*Completed: 2026-06-09*
