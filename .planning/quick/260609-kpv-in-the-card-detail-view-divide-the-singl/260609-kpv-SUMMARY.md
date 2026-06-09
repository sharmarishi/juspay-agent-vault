---
phase: quick-260609-kpv
plan: 01
subsystem: cards
tags: [refactor, ui, tabs, card-detail]
dependency_graph:
  requires: []
  provides: [tabbed-card-detail-modal]
  affects: [src/components/cards/CardDetailModal.tsx]
tech_stack:
  added: []
  patterns: [useState, useEffect, tab-bar, JUSPAY_ACCENT inline style]
key_files:
  created: []
  modified:
    - src/components/cards/CardDetailModal.tsx
decisions:
  - "Default tab is Controls — universally present for both card types; MFA/limit settings are the primary action target"
  - "Tab reset uses card?.id (prop) not liveCard.id (derived after guard) to keep useEffect unconditionally above early return"
  - "activeTab belt-and-suspenders fallback to 'controls' guards against any future state mismatch without conditional hook"
  - "Virtual cards tab hidden entirely for virtual cards (not relabeled) — they have no children by definition"
  - "Freeze/delete actions stay in Controls tab (grouped with settings), not promoted to persistent header"
metrics:
  duration: 10m
  completed: 2026-06-09
  tasks_completed: 2
  files_modified: 1
---

# Quick Task 260609-kpv Summary

**One-liner:** Tabbed CardDetailModal with persistent header (CardVisual + Simulate button + spend bar) above Virtual cards / Controls / Used by apps tabs using the PaymentsSection JUSPAY_ACCENT pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add tab state with card-aware reset and tab type | 1c2a0a7 | CardDetailModal.tsx |
| 2 | Render persistent header + tab bar + tab panels | cdf7de2 | CardDetailModal.tsx |

## What Was Built

**CardDetailModal** reorganized from a single long scroll into:

1. **Persistent header** (always visible above tab bar):
   - `CardVisual` (large card art)
   - Issued-under line for virtual cards
   - Simulate a payment button (JUSPAY_ACCENT, `onClick={() => setSimulateOpen(true)}`)
   - Spend-vs-limit bar

2. **Tab bar** — mirrors PaymentsSection's segmented control exactly:
   - Active tab: `color: JUSPAY_ACCENT, borderColor: JUSPAY_ACCENT, border-current font-medium`
   - Inactive: `border-transparent text-gray-500 hover:text-gray-700`
   - Physical cards: Virtual cards / Controls / Used by apps (3 tabs)
   - Virtual cards: Controls / Used by apps (2 tabs — "Virtual cards" omitted)

3. **Tab panels** (only active rendered):
   - **Virtual cards**: child card list with `onSelectCard` drill-down
   - **Controls**: Settings card (limit/MFA inputs + toggle + status) + freeze/delete actions
   - **Used by apps**: AppUsageBreakdown + Transaction history

**State machine:**
- `useState<DetailTab>("controls")` — default Controls
- `useEffect(() => { setTab("controls"); }, [card?.id])` — reset on card switch
- `activeTab` derived with `visibleTabs.some(t => t.key === tab) ? tab : "controls"` — belt-and-suspenders guard

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `npx tsc --noEmit`: PASSED (no type errors)
- `npm run build`: PASSED (966 kB bundle, chunk warning is pre-existing)
- `npm test`: PASSED (18/18 tests)

## Self-Check: PASSED

- `src/components/cards/CardDetailModal.tsx` exists and contains tab state, visibleTabs, activeTab, tab bar JSX, and three conditional panels
- Commits 1c2a0a7 and cdf7de2 exist in git log
- All handlers preserved: `setSimulateOpen`, `onSelectCard`, `updateCard` (limit/MFA/status/freeze), `removeCard`+`onClose`, `SimulatePaymentModal` key/cardId/onClose wiring
