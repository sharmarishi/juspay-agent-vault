---
phase: 04-transactions-usage-dashboard
plan: "02"
subsystem: card-detail-app-usage
tags: [usage-attribution, transaction-history, app-breakdown, card-detail]
dependency_graph:
  requires: [04-01]
  provides: [USAGE-01, USAGE-02, TXN-01]
  affects: [src/components/cards/CardDetailModal.tsx, src/components/payments/AppUsageBreakdown.tsx]
tech_stack:
  added: []
  patterns: [selector-per-field zustand, live-reactive store reads, lucide icon renderer]
key_files:
  created:
    - src/components/payments/AppUsageBreakdown.tsx
  modified:
    - src/components/cards/CardDetailModal.tsx
decisions:
  - "AppUsageBreakdown reads directly from useVaultStore to stay reactive — simulated payments update the breakdown live without prop drilling"
  - "All transaction statuses included in usage totals — attribution is about usage, not just settled spend"
  - "appName() inline resolver avoids prop drilling while keeping per-row attribution co-located with rendering"
metrics:
  duration_minutes: 8
  completed_date: "2026-06-09"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 04 Plan 02: App Usage Breakdown + Full Transaction History Summary

**One-liner:** Per-card app-spend attribution component wired into CardDetailModal with full untruncated transaction history and per-row app names.

## What Was Built

### Task 1: AppUsageBreakdown component (USAGE-01)

New file `src/components/payments/AppUsageBreakdown.tsx` — accepts a `cardId` prop, reads `transactions` and `apps` live from the Zustand store, groups card transactions by `appId`, sums `amount` and counts transactions per app, resolves each `appId` to the connected app's name and icon, then renders a sorted-by-spend-descending list. Each row shows an icon chip (via `IconRenderer`), app name, transaction count subline, and total spent. Reactive: simulated payments update the breakdown instantly.

### Task 2: CardDetailModal enhancements (USAGE-01, USAGE-02, TXN-01)

Enhanced `src/components/cards/CardDetailModal.tsx`:
- Imported `AppUsageBreakdown` and rendered it above the transaction list with `cardId={liveCard.id}`
- Added `useVaultStore((s) => s.apps)` selector and `appName(appId)` inline resolver
- Renamed "Recent activity" to "Transaction history" — signals the full (untruncated) per-card history
- Added `{appName(t.appId)} · {t.date}` to each transaction row subline for per-row app attribution
- `cardTxns` remains `.filter(...).sort(...)` with no `.slice()` — full history always displayed
- All Phase 3 functionality preserved: editable limit/MFA threshold/MFA toggle, Simulate-a-payment button, SimulatePaymentModal, freeze/delete actions

## Deviations from Plan

None — plan executed exactly as written.

## Requirements Satisfied

- USAGE-01: Per-card view shows which connected apps used the card and how much each spent
- USAGE-02: Each transaction row is attributed to its initiating app
- TXN-01: Full per-card transaction history (date, app/merchant, amount, status; subscriptions identifiable via existing pill)

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 0960de6 | feat(04-02): add AppUsageBreakdown component (USAGE-01) |
| 2 | ba44663 | feat(04-02): wire AppUsageBreakdown into CardDetailModal (USAGE-01, USAGE-02, TXN-01) |

## Self-Check: PASSED
