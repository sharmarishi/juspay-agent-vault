---
phase: quick-260609-npa
plan: 01
subsystem: settings-nav, shopping-flow
tags: [shopping, mfa, demo, state-machine, nav]
dependency_graph:
  requires: [useVaultStore, Toggle, IconRenderer, JUSPAY_ACCENT, SimulatePaymentModal-pattern]
  provides: [ShoppingSection, shopping-nav-item, shopping-routing]
  affects: [SettingsContent, navItems, transactions-store, card-spent]
tech_stack:
  added: []
  patterns: [step-state-machine, selector-per-field-zustand, DEMO_OTP-mfa-pattern]
key_files:
  created:
    - src/sections/ShoppingSection.tsx
  modified:
    - src/components/settings/navItems.ts
    - src/components/settings/SettingsContent.tsx
decisions:
  - Shopping nav item placed immediately after Payments (between payments and data-controls)
  - In-file CATALOG for cup/shoes/headphones/shirt with generic fallback; alias map for mug/shirt variants
  - Both-toggles gate (limitOn && mfaOn) before Proceed to Pay — mirrors plan spec exactly
  - DEMO_OTP "123456" pattern mirrored verbatim from SimulatePaymentModal
  - confirmPurchase writes addTransaction + updateCard(spent) — same postPayment recipe
metrics:
  duration_minutes: 8
  completed_date: "2026-06-09T11:38:23Z"
  tasks_completed: 2
  files_created: 1
  files_modified: 2
---

# Quick Task 260609-npa: Add a Guided Shopping / Commerce Demo Section — Summary

**One-liner:** Six-step agentic shopping state machine (request → options → card → controls → MFA challenge → confirmation) wired as a new "Shopping" settings nav item after Payments, recording real transactions on confirm via DEMO_OTP "123456".

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Build ShoppingSection multi-step state machine | 252df89 | src/sections/ShoppingSection.tsx (+480 lines) |
| 2 | Wire Shopping into nav and routing | 957a318 | navItems.ts, SettingsContent.tsx |

## What Was Built

### ShoppingSection (`src/sections/ShoppingSection.tsx`)

A self-contained 480-line React component implementing a six-step purchase demo:

1. **request** — Text input + example chips ("buy me a cup", "get running shoes", "order headphones"). Continue button disabled on empty query.
2. **options** — `resolveVariants(query)` returns catalog matches or generic fallback; responsive `grid-cols-1 sm:grid-cols-2` grid; selecting a variant advances to step 3.
3. **card** — All store cards listed as selectable rows (colored dot + icon + label + masked number). Empty-state message pointing to Payments section when `cards.length === 0`.
4. **controls** — Two Toggle rows ("Spend limit under control", "MFA required"). "Proceed to Pay" primary button renders only when `limitOn && mfaOn`; gray hint shown otherwise.
5. **mfa** — Indigo callout ("Verify this payment"), 6-char OTP input (tracking-widest, text-center, inputMode=numeric), demo hint "Enter the code: 123456", red error block on wrong code.
6. **confirmed** — Green CheckCircle2, product swatch + name + price, card used, "Shop again" resets all state.

**CATALOG:** cup (3 variants), shoes (3), headphones (3), shirt (3); alias map for mug/t-shirt/sneakers/earbuds. Generic fallback: "Blue {noun}" + "White {noun}".

**confirmPurchase():** mirrors SimulatePaymentModal.postPayment exactly — `addTransaction` + `updateCard(card.id, { spent: card.spent + variant.price })`.

**Back navigation:** each step (options/card/controls/mfa) has a subtle Back link via a `BACK_MAP`.

### Nav + Routing

- `navItems.ts`: ShoppingBag imported, `{ id: "shopping", label: "Shopping", icon: ShoppingBag }` inserted between payments and data-controls.
- `SettingsContent.tsx`: `ShoppingSection` imported, render branch `if (selected === "shopping") return <ShoppingSection />;` added to `renderBody()`.

## Build & Test Results

```
npm run build  → tsc + vite build clean (0 errors, 0 type errors)
npm test       → 24/24 tests passed (no regressions)
```

## Deviations from Plan

None — plan executed exactly as written.

## Checkpoint: Manual Verification Steps

The plan includes a `checkpoint:human-verify`. Automated verification (build + tests) is complete. The following manual flows should be verified by running `npm run dev`:

**1. Happy path:**
- Open Settings → Shopping
- Type "buy me a cup" (or click the chip) → Continue
- Pick the Blue Ceramic Mug variant
- Select any card
- Turn ON both toggles → "Proceed to Pay" button appears
- Click Proceed → enter `123456` → see confirmation screen with product, price, card
- Open Settings → Payments → Transactions → confirm new transaction (merchant = "Blue Ceramic Mug", amount $14.00) is recorded

**2. Wrong OTP:**
- Repeat to the MFA step, enter `000000` → expect "Incorrect code. Try again." error
- Enter `123456` → confirmation succeeds

**3. Zero-card empty state:**
- Delete all cards in Payments → Cards
- Go to Shopping → advance to the card step
- Expect friendly empty-state ("No payment cards yet… Go to Payments section")

**4. Mobile (375px):**
- Verify all steps render without horizontal overflow
- Options grid collapses to single column

## Known Stubs

None — all steps are fully wired with live store data.

## Self-Check: PASSED

- [x] `src/sections/ShoppingSection.tsx` exists (480 lines)
- [x] Commit 252df89 exists
- [x] Commit 957a318 exists
- [x] `npm run build` clean
- [x] `npm test` 24/24 green
- [x] Shopping nav item present after Payments in navItems.ts
- [x] SettingsContent.tsx routes `selected === "shopping"` to ShoppingSection
