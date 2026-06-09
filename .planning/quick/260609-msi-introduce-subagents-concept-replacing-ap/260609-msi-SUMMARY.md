---
phase: quick-260609-msi
plan: 01
subsystem: data-model, store, persistence, card-ui, payment-ui
tags: [subagents, rename, migration, schema-v2]
dependency_graph:
  requires: []
  provides: [subagent-model, card-subagent-access, subagent-transaction-display]
  affects: [AddCardModal, CardDetailModal, SimulatePaymentModal, AppUsageBreakdown, TransactionsList, persistence]
tech_stack:
  added: []
  patterns: [SCHEMA_VERSION migration, APP_TO_SUBAGENT mapping, subagent chip multi-select, JUSPAY_ACCENT pill]
key_files:
  created: []
  modified:
    - src/data/types.ts
    - src/data/seed.ts
    - src/store/useVaultStore.ts
    - src/store/persistence.ts
    - src/store/persistence.test.ts
    - src/components/cards/AddCardModal.tsx
    - src/components/cards/CardDetailModal.tsx
    - src/components/cards/SimulatePaymentModal.tsx
    - src/components/payments/AppUsageBreakdown.tsx
    - src/components/payments/TransactionsList.tsx
decisions:
  - "ConnectedApp→Subagent is a category rename (Grocery, Travel…) distinct from merchant (Safeway, Booking.com…)"
  - "APP_TO_SUBAGENT map in persistence.ts covers all 6 legacy seed appIds for safe v1→v2 migration"
  - "Simulate Payment derives merchant as '<SubagentName> purchase' — keeps one-tap flow, avoids second dropdown"
  - "Card.subagentIds is store+display only (no enforcement) — grants intent, not a payment gate"
  - "JUSPAY_ACCENT+'14' (8% opacity hex suffix) used for subagent pills to keep neutral ChatGPT aesthetic"
metrics:
  duration: "~12 minutes"
  completed_date: "2026-06-09"
  tasks_completed: 4
  files_modified: 10
---

# Quick Task 260609-msi: Introduce Subagents concept (replacing Apps)

**One-liner:** Full ConnectedApp→Subagent rename — data model, SCHEMA_VERSION 2 migration with appId→subagentId mapping, Add-Card multi-select, card-detail granted-subagents display, merchant+colored-subagent transaction rows, "Used by Subagents" breakdown, and Subagent picker in Simulate Payment.

## Objective

Replace the "apps" / `ConnectedApp` concept with "Subagents" (use-case CATEGORIES) across the entire stack: types, seed, store snapshot, persistence migration, and all UI surfaces. Subagents are categories (Grocery, Travel, SaaS…) distinct from a transaction's merchant (Safeway, Booking.com…). Each transaction carries BOTH a merchant and a subagentId. Cards record which subagents may access them (store + display only).

## Tasks Completed

| # | Task | Commit | Result |
|---|------|--------|--------|
| 1 | Domain model + seed + store + SCHEMA_VERSION 2 migration | `85fb888` | 24/24 tests pass |
| 2 | Add Card subagent multi-select + card-detail granted-subagents | `1f67995` | Build clean |
| 3 | Transaction rows + Used by Subagents + Simulate subagent picker | `74a7168` | Build clean, 24/24 tests |
| 4 | Human-verify checkpoint | N/A | Documented below |

## Build & Test Results

```
npm run build  → tsc + vite: CLEAN (0 errors)
npm test       → 24/24 tests PASS (2 test files)
```

New tests added (6):
- `migration: legacy appId transaction gets mapped subagentId and appId removed`
- `migration: card without subagentIds gets subagentIds: []`
- `migration: SEED cards all have subagentIds array`
- `migration: SEED transactions all have subagentId + merchant`
- `migration: legacy apps state gets replaced with canonical SUBAGENTS list`
- `migration: unknown appId gets fallback subagentId sub_shopping`

## What Changed

### Data Model (src/data/types.ts)
- `ConnectedApp` → `Subagent` (fields: id, name, icon — same shape)
- `Transaction.appId: string` → `Transaction.subagentId: string`
- `Transaction.merchant: string` — kept (specific vendor)
- `Card.subagentIds: string[]` — added (which subagent categories may access)
- `VaultState.apps` → `VaultState.subagents`

### Seed (src/data/seed.ts)
- `APPS` → `SUBAGENTS` — 6 category subagents: Shopping (`sub_shopping`), Grocery (`sub_grocery`), Gaming (`sub_gaming`), SaaS (`sub_saas`), Travel (`sub_travel`), Entertainment (`sub_entertainment`)
- 14 transactions each with a distinct `merchant` (specific vendor) and `subagentId` (category)
- Merchant pool: Grocery→Whole Foods/Safeway/Instacart, Travel→Booking.com/Expedia, Entertainment→Spotify/Netflix/Ticketmaster, SaaS→Notion/Figma, Gaming→Steam, Shopping→Amazon/Best Buy
- 2 `isSubscription: true` entries (Spotify/Entertainment, Notion/SaaS)
- All cards have `subagentIds: []`
- `schemaVersion: 2`

### Persistence Migration (src/store/persistence.ts)
- `SCHEMA_VERSION` bumped to `2`
- `APP_TO_SUBAGENT` map: `app_instacart→sub_grocery`, `app_booking→sub_travel`, `app_expedia→sub_travel`, `app_spotify→sub_entertainment`, `app_notion→sub_saas`, `app_chatgpt→sub_shopping`
- `migrate()` extended: transaction `appId` → `subagentId` (with fallback `sub_shopping`); cards get `subagentIds: []` if missing; empty/missing `subagents` → canonical SEED list; legacy `apps` key deleted
- Existing orphan-virtual-card migration kept and working

### UI Changes

**AddCardModal.tsx** — `SubagentSelector` chip multi-select (template + custom modes); `subagentIds` on all `addCard()` calls

**CardDetailModal.tsx** — `subagents` selector replacing `apps`; "Subagent access" block below card visual (chips or "No subagents granted access yet."); tab label "Used by Subagents"; transaction rows: merchant primary + JUSPAY_ACCENT tinted subagent pill + date-only meta line

**TransactionsList.tsx** — `subagents` replacing `apps`; merchant primary + JUSPAY_ACCENT subagent pill; card+date meta line (no subagent in meta)

**AppUsageBreakdown.tsx** — group by `subagentId`; title "Used by Subagents"; empty state "No subagent usage yet."

**SimulatePaymentModal.tsx** — `subagents` replacing `apps`; `subagentId` state replacing `appId`; label "Subagent"; derived merchant `"<SubagentName> purchase"` on created transaction

## Manual Verification Steps (Task 4 checkpoint)

Run `npm run dev` and navigate to the ChatGPT Settings → Payments section:

1. **Add Card → Token Templates:** Confirm "Which Subagents can access this card" chips appear (6 categories). Toggle multiple, create a card with 2 selected.
2. **Open that card's detail:** Confirm selected subagents appear as chips in "Subagent access". Open a seeded card (e.g. Groceries) — confirm it shows "No subagents granted access yet." (seeds start with empty subagentIds).
3. **Transactions tab (overview) AND card detail → "Used by Subagents" → Transaction history:** Each row shows specific merchant (e.g. "Safeway") plus a distinct indigo-tinted pill (e.g. "Grocery"). Verify at desktop and 375px mobile width.
4. **Card detail tab bar:** Confirm tab label is "Used by Subagents" (not "Used by apps").
5. **AppUsageBreakdown header:** Confirm "Used by Subagents" heading and category grouping.
6. **Simulate a payment:** Picker label is "Subagent"; options are categories (Shopping, Grocery…). After payment, new row shows "<Category> purchase" as merchant with category pill. MFA/over-limit flow unchanged.
7. **(Optional) Migration:** Clear localStorage, paste a v1-shaped payload with `appId: "app_instacart"`. Reload — confirm transaction shows `sub_grocery` category.

## Deviations from Plan

None — plan executed exactly as written. The tsc errors from the build mid-Task 1 were expected (UI components still using old `apps`/`appId`), and Tasks 2+3 resolved all errors within the same overall implementation flow.

## Known Stubs

None. All subagent data is wired end-to-end: seed → store → UI. Seeded cards have `subagentIds: []` by design (user grants access via Add Card; no enforcement needed as this is display-only per spec).

## Self-Check: PASSED

- FOUND: src/data/types.ts (Subagent interface, Transaction.subagentId, Card.subagentIds)
- FOUND: src/data/seed.ts (SUBAGENTS list, 14 transactions with merchant+subagentId)
- FOUND: src/store/persistence.ts (SCHEMA_VERSION=2, APP_TO_SUBAGENT map)
- FOUND: src/components/cards/AddCardModal.tsx (SubagentSelector, subagentIds in addCard)
- FOUND: src/components/payments/AppUsageBreakdown.tsx ("Used by Subagents" header)
- Commits: 85fb888, 1f67995, 74a7168 — all present
- Build: tsc + vite CLEAN (0 errors)
- Tests: 24/24 PASS
