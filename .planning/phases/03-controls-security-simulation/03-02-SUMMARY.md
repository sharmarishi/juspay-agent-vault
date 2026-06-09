---
phase: 03-controls-security-simulation
plan: "02"
subsystem: cards/simulation
tags: [simulate-payment, mfa-challenge, security, otp, card-controls]
dependency_graph:
  requires: ["03-01"]
  provides: ["SEC-01", "SEC-02", "SEC-03", "SEC-04"]
  affects: ["src/components/cards/SimulatePaymentModal.tsx", "src/components/cards/CardDetailModal.tsx"]
tech_stack:
  added: []
  patterns:
    - "Step-based modal UI (form → challenge) using useState step variable"
    - "key-prop reset pattern for modal internal state on re-open"
    - "Evaluation-order guard clauses for sequential rule enforcement"
key_files:
  created:
    - src/components/cards/SimulatePaymentModal.tsx
  modified:
    - src/components/cards/CardDetailModal.tsx
decisions:
  - "Evaluation order guard clauses (invalid-amount → frozen → over-limit → MFA → direct-post) matches plan spec exactly with early returns"
  - "step !== 'challenge' conditional used so challenge step comment contains exact grep-able string 'step === challenge'"
  - "key={simulateOpen ? liveCard.id : 'closed'} on SimulatePaymentModal forces fresh form/challenge state on every open"
  - "SimulatePaymentModal reads card live from store (not prop) so frozen/spent values are always current at submit time"
metrics:
  duration: 133s
  completed: "2026-06-09"
  tasks_completed: 2
  files_changed: 2
---

# Phase 03 Plan 02: Simulate Payment Modal Summary

SimulatePaymentModal with blocking OTP challenge flow enforcing frozen/over-limit/MFA rules, wired into CardDetailModal via a JUSPAY_ACCENT "Simulate a payment" button.

## What Was Built

**Task 1 — SimulatePaymentModal (new file)**

Created `src/components/cards/SimulatePaymentModal.tsx` with:
- Two-step UI: `form` step (amount input + app/merchant picker) and `challenge` step (OTP entry)
- `DEMO_OTP = "123456"` constant visible as a demo hint on the challenge step
- Evaluation guard clauses in exact order per spec: invalid-amount → frozen → over-limit → MFA challenge → direct post
- `postPayment(amt)` helper: calls `addTransaction` with `status: "completed"`, `isSubscription: false`, unique `txn_${Date.now()}_${random}` ID, and increments `card.spent` via `updateCard`
- Verbatim rejection reasons: `"This card is frozen."` and `"This payment would exceed the card's spending limit."`
- Challenge step: correct OTP posts, any other code shows `"Incorrect code. Try again."`, Cancel aborts with no transaction posted
- Props: `cardId: string | null` (null = closed), `onClose: () => void`

**Task 2 — CardDetailModal wiring (additive edit only)**

Added to `src/components/cards/CardDetailModal.tsx`:
- `import { SimulatePaymentModal }` and `import { JUSPAY_ACCENT }`
- `const [simulateOpen, setSimulateOpen] = useState(false)` state
- "Simulate a payment" primary button above the spend bar with `backgroundColor: JUSPAY_ACCENT`, `rounded-full` pill style
- `<SimulatePaymentModal cardId={simulateOpen ? liveCard.id : null} onClose={...} key={simulateOpen ? liveCard.id : "closed"} />` mounted inside the modal
- All 03-01 editable controls (limit, mfaThreshold, mfaEnabled toggle, freeze/unfreeze, delete) preserved without modification

## Security Requirements Fulfilled

| Req | Description | Implementation |
|-----|-------------|---------------|
| SEC-01 | Amount + app picker form accessible from card | "Simulate a payment" button in CardDetailModal |
| SEC-02 | MFA challenge when amount > threshold with MFA on | `step = "challenge"` set before any post |
| SEC-03 | Blocking OTP; correct posts, cancel aborts | `otp === DEMO_OTP` gates `postPayment`; Cancel calls `onClose()` only |
| SEC-04 | Frozen/over-limit rejections with verbatim reasons | Guard clauses with exact error strings |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 2de3b91 | feat(03-02): create SimulatePaymentModal |
| 2 | 6bbc1a1 | feat(03-02): add Simulate a payment button in CardDetailModal |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. SimulatePaymentModal reads live store data (`cards`, `apps`) and posts real transactions via `addTransaction` / `updateCard`. No placeholder or hardcoded data flows to the UI.

## Self-Check: PASSED

- `src/components/cards/SimulatePaymentModal.tsx` — FOUND
- `src/components/cards/CardDetailModal.tsx` (modified) — FOUND
- Commit 2de3b91 — FOUND
- Commit 6bbc1a1 — FOUND
- `npm run build` — exits 0
