---
phase: 01-shell-data
plan: 02
subsystem: data-layer
tags: [zustand, types, seed, persistence, localStorage, vitest]
dependency_graph:
  requires: [01-shell-data-01]
  provides: [useVaultStore, VaultState, Card, Transaction, ConnectedApp, SEED, loadState, saveState]
  affects: [01-shell-data-03, all-card-management, all-controls, all-security, all-transactions]
tech_stack:
  added: [zustand@5, vitest@4, jsdom@29, @vitest/ui]
  patterns: [zustand-create, localStorage-manual-persist, structuredClone-for-deep-clone]
key_files:
  created:
    - src/data/types.ts
    - src/data/seed.ts
    - src/store/persistence.ts
    - src/store/useVaultStore.ts
    - src/store/persistence.test.ts
    - vitest.config.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - Zustand manual persistence (no persist middleware) — keeps schema explicit and inspectable
  - vi.stubGlobal for localStorage mock — avoids Node.js v25 native localStorage conflicts with jsdom
  - structuredClone for SEED deep clones — ensures mutations never corrupt the original seed reference
metrics:
  duration: ~20 minutes
  completed: 2026-06-09
  tasks_completed: 2
  files_created: 6
  files_modified: 2
---

# Phase 1 Plan 02: Seeded Data Layer Summary

**One-liner:** Zustand store initializing from localStorage-or-seed with manual save-on-mutation persistence, backed by TypeScript domain types and a 6-card/14-transaction/6-app seed dataset.

## What Was Built

### Type Shapes (downstream phases depend on these field names)

**`src/data/types.ts`** exports:

```
CardType = "physical" | "virtual"
CardStatus = "active" | "frozen"
UseCase = "groceries" | "saas" | "travel" | "shopping" | "general" | "custom"

Card { id, type, useCase, label, maskedNumber, status, limit, spent,
       mfaThreshold, mfaEnabled, color, icon, holder?, expiry? }

Transaction { id, cardId, appId, merchant, amount, date, status, isSubscription }

ConnectedApp { id, name, icon }

VaultState { cards: Card[], transactions: Transaction[], apps: ConnectedApp[] }
```

### Seed Dataset (`src/data/seed.ts`)

Exports `const SEED: VaultState` with:

| Cards (6 total) | Type | UseCase | Status |
|---|---|---|---|
| card_physical_01 (•••• 4821) | physical | general | active |
| card_groceries_01 (•••• 3172) | virtual | groceries | active |
| card_saas_01 (•••• 8834) | virtual | saas | active |
| card_travel_01 (•••• 5590) | virtual | travel | **frozen** |
| card_shopping_01 (•••• 2247) | virtual | shopping | active |
| card_custom_01 (•••• 9061) | virtual | custom | active |

- Physical card: holder = "Rishi Sharma", expiry = "09/27"
- Each card has distinct color hex, lucide icon, non-zero spent value, sensible limit + mfaThreshold + mfaEnabled

**Transactions (14 total):**
- `isSubscription: true`: txn_001 (Spotify Premium $11.99), txn_002 (Notion Pro $16.00) — both on card_saas_01
- Mixed statuses: completed / pending / declined
- Dates span last 30 days
- Apps attributed: app_instacart, app_spotify, app_notion, app_chatgpt, etc.

**Connected Apps (6):** Instacart, Booking.com, Expedia, Spotify, Notion, ChatGPT

### Persistence (`src/store/persistence.ts`)

```ts
STORAGE_KEY = "juspay-agent-vault"
loadState(): VaultState   // reads localStorage or falls back to structuredClone(SEED)
saveState(s: VaultState): void  // writes JSON.stringify(s) to STORAGE_KEY
```

- Wraps JSON.parse in try/catch — malformed JSON silently falls back to SEED clone
- Guards for SSR (typeof window check)

### Store Hook (`src/store/useVaultStore.ts`)

```ts
useVaultStore(): VaultStore
```

State: `cards`, `transactions`, `apps`

Actions (each mutates then calls `saveState`):
- `updateCard(id, partial: Partial<Card>)` — patch card by id
- `addCard(card: Card)` — append card
- `removeCard(id)` — remove card + its transactions
- `addTransaction(txn: Transaction)` — append transaction
- `reset()` — restore `structuredClone(SEED)` and persist (DATA-03)

Initializes from `loadState()` so it boots seeded on first run or from saved state.

### localStorage Key

`"juspay-agent-vault"` — all persistence reads and writes use this key.

## Test Results

`npm test` — 5/5 passing:
1. loadState returns SEED clone when localStorage empty
2. loadState returns deep clone (different references)
3. loadState returns saved state when localStorage has valid JSON
4. loadState returns SEED clone on malformed JSON
5. saveState persists so subsequent loadState returns it

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Node.js v25 native localStorage conflicts with vitest jsdom**
- **Found during:** Task 1 (GREEN phase, first test run)
- **Issue:** Node.js v25 has native `localStorage` built in but without `.clear()`. When vitest loads the test environment, the Node.js native localStorage was used instead of jsdom's, causing `TypeError: localStorage.clear is not a function`
- **Fix:** Replaced `localStorage.clear()` calls in beforeEach/afterEach with a `vi.stubGlobal("localStorage", localStorageMock)` approach using a simple in-memory mock. This sidesteps the Node.js v25 / jsdom conflict entirely.
- **Files modified:** src/store/persistence.test.ts
- **Commit:** 4c7df35

## Known Stubs

None — the data layer is fully wired. The store initializes from real seed data and all actions are implemented. The Payments UI pane (plan 01-03) will consume `useVaultStore` to render this data.

## Self-Check: PASSED

All files created:
- FOUND: src/data/types.ts
- FOUND: src/data/seed.ts
- FOUND: src/store/persistence.ts
- FOUND: src/store/useVaultStore.ts
- FOUND: src/store/persistence.test.ts
- FOUND: vitest.config.ts

All commits exist:
- FOUND: 4c7df35 (Task 1 — types + seed + persistence)
- FOUND: a134025 (Task 2 — useVaultStore)
