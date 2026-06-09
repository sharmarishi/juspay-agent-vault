---
phase: quick-260609-kbu
plan: 01
type: quick-fix
subsystem: cards
tags: [virtual-cards, data-model, migration, ui, drill-down]
dependency_graph:
  requires: []
  provides: [parentCardId-on-Card, schema-migration, physical-card-selector, hierarchical-cards-ui]
  affects: [AddCardModal, PaymentsSection, CardDetailModal, persistence, seed]
tech_stack:
  added: []
  patterns: [schema-migration, TDD-red-green, IIFE-in-JSX]
key_files:
  created: []
  modified:
    - src/data/types.ts
    - src/data/seed.ts
    - src/store/persistence.ts
    - src/store/persistence.test.ts
    - src/components/cards/AddCardModal.tsx
    - src/sections/PaymentsSection.tsx
    - src/components/cards/CardDetailModal.tsx
decisions:
  - migrate() runs idempotently on every loadState() call — no per-version branch needed at this scale
  - Drill-down reuses setDetailCard in PaymentsSection via onSelectCard? prop — no new modal or state path
  - IIFE used in JSX to scope physicalCards derivation without a new component
metrics:
  duration: 33min
  completed: 2026-06-09
  tasks_completed: 3
  files_changed: 7
---

# Phase quick-260609-kbu Plan 01: Virtual Card Hierarchy Fixes Summary

**One-liner:** parentCardId on Card + schema migration attaching orphans to first physical card + hierarchical Cards UI with physical-only grid and virtual-children drill-down.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Failing migration tests | fc4e1e8 | src/store/persistence.test.ts |
| 1 (GREEN) | parentCardId + migration + seed parents | dff5a0a | src/data/types.ts, src/data/seed.ts, src/store/persistence.ts |
| 2 | Physical-card selector in AddCardModal | f360221 | src/components/cards/AddCardModal.tsx |
| 3 | Physical-only Cards grid + virtual-children drill-down | e05499f | src/sections/PaymentsSection.tsx, src/components/cards/CardDetailModal.tsx |

## What Was Built

### Data Model (types.ts)
- `Card` gains `parentCardId?: string` — virtual only, FK to a physical Card.id
- `VaultState` gains `schemaVersion?: number`

### Seed (seed.ts)
- All 5 virtual cards (groceries, saas, travel, shopping, custom) now carry `parentCardId: "card_physical_01"`
- SEED object has `schemaVersion: 1`

### Schema Migration (persistence.ts)
- `export const SCHEMA_VERSION = 1`
- `migrate(state)`: finds first physical card; maps virtual cards — if missing `parentCardId` and a physical card exists, attaches it. Stamps `schemaVersion`. Returns new state without mutation.
- `loadState()` now always calls `migrate(parsed)` so every load path gets current schema. Idempotent — already-parented cards are left unchanged.

### AddCardModal (template + custom modes)
- Reads `physicalCards = cards.filter(c => c.type === "physical")` from store
- Adds `parentCardId` state, reset in `resetForm`
- Renders "Issued under (physical card)" `<select>` above submit in both template and custom modes
- When no physical cards exist: shows red error note, submit is disabled
- `handleTemplateSubmit` and `handleCustomSubmit` include `parentCardId: parentCardId || physicalCards[0]?.id` in `addCard()` payload
- `templateValid` and `customValid` gated on `physicalCards.length > 0`

### PaymentsSection (Cards tab)
- Grid now maps over `physicalCards = cards.filter(c => c.type === "physical")` only
- Empty state checks `physicalCards.length`
- `CardDetailModal` now receives `onSelectCard={(c) => setDetailCard(c)}`

### CardDetailModal
- `onSelectCard?: (card: Card) => void` added to props
- Computes `childCards` for physical cards: `cards.filter(c => c.type === "virtual" && c.parentCardId === liveCard.id)`
- Computes `parentLabel` for virtual cards via `parentCardId` lookup
- Physical cards render a "Virtual cards" section listing children as clickable rows (icon, label, maskedNumber, status badge); clicking calls `onSelectCard?.(child)`
- Virtual cards render a subtle "Issued under {parentLabel}" line below the card visual

## Verification

- `npm test` — 14/14 tests pass (all migration tests green)
- `npm run build` — TypeScript + Vite build passes cleanly

## Human-Verify Steps

1. `npm run dev` and open Settings → Payments → Cards tab
2. Confirm grid shows ONLY the 1 physical card (no standalone virtual cards)
3. Click the physical card → verify "Virtual cards" section lists 5 seeded virtual cards
4. Click a virtual child (e.g. Groceries) → its detail opens with spend bar, settings, simulate button, and "Issued under Personal" line
5. Click "+ Add card" → "From template" → confirm "Issued under (physical card)" selector appears; create card → reopen physical card detail and verify new virtual card appears
6. Click "+ Add card" → "Custom virtual" → same selector test
7. (Migration sanity) If prior localStorage exists, virtual cards should appear under the physical card rather than disappearing

## Deviations from Plan

None — plan executed exactly as written. Task 1 followed TDD (RED commit fc4e1e8, then GREEN commit dff5a0a). IIFE used in JSX for physicalCards scoping in PaymentsSection rather than extracting a variable at component level — functionally equivalent, keeps the filter logic co-located with the JSX that uses it.

## Known Stubs

None — all new functionality is wired to live store data.

## Self-Check

- [x] src/data/types.ts — modified (parentCardId, schemaVersion)
- [x] src/data/seed.ts — modified (parentCardId on 5 virtual cards, schemaVersion: 1)
- [x] src/store/persistence.ts — modified (SCHEMA_VERSION, migrate, loadState)
- [x] src/store/persistence.test.ts — modified (4 new migration tests)
- [x] src/components/cards/AddCardModal.tsx — modified (physicalCards selector)
- [x] src/sections/PaymentsSection.tsx — modified (physicalCards grid, onSelectCard)
- [x] src/components/cards/CardDetailModal.tsx — modified (childCards, parentLabel, Virtual cards section)
- [x] Commits: fc4e1e8, dff5a0a, f360221, e05499f — all on worktree-agent-ac27ce5ed66475281 branch

## Self-Check: PASSED
