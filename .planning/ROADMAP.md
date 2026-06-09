# Roadmap: Juspay Agent Vault

## Overview

Four phases build the demo from the ground up. Phase 1 establishes the ChatGPT settings shell and data layer so every subsequent phase has a working surface and realistic state. Phase 2 delivers the complete card management experience — physical and virtual cards, card detail, freeze, and delete. Phase 3 implements spending controls, MFA configuration, and the full simulate-payment + MFA-challenge flow that is the core value demonstration. Phase 4 completes the demo with transaction histories, app-usage attribution, and the payments dashboard.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Shell + Data** - ChatGPT settings modal shell, nav, co-brand, layout, seeded data, and localStorage persistence (completed 2026-06-09)
- [ ] **Phase 2: Card Management** - Add physical cards, generate virtual cards (templates + custom), card list, card detail, freeze, and delete
- [ ] **Phase 3: Controls + Security Simulation** - Spending limits, MFA thresholds, MFA toggle, spend-progress indicator, and the full simulate-payment + MFA-challenge flow
- [ ] **Phase 4: Transactions, Usage + Dashboard** - Transaction histories, subscription representation, app-usage attribution, and the payments overview dashboard

## Phase Details

### Phase 1: Shell + Data
**Goal**: The ChatGPT settings modal shell is live, navigable, and pre-loaded with realistic demo data that persists across refresh
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Opening the app shows a ChatGPT-style settings modal with a left nav and a content pane that matches the clean light aesthetic from the reference screenshots
  2. Clicking "Payments" in the left nav navigates to the Payments section; clicking other nav items (General, Security, etc.) shows their shell placeholders
  3. A "Powered by Juspay" co-brand mark and Juspay accent color appear on payment cards without breaking the ChatGPT look
  4. Seeded cards, transactions, and app-usage data are visible immediately without any user action
  5. After editing a limit or toggling a card, refreshing the page preserves the change; a "Reset demo" action restores the original seeded state
**Plans**: 3 plans
Plans:
- [x] 01-01-PLAN.md — Vite+React+TS+Tailwind scaffold + ChatGPT settings modal shell (nav incl. Payments, primitives, Juspay co-brand)
- [x] 01-02-PLAN.md — Seeded demo data layer: types, seed dataset, Zustand store + localStorage persistence
- [x] 01-03-PLAN.md — Wire Payments pane to store: seeded card list + Reset demo button (end-to-end)
**UI hint**: yes

### Phase 2: Card Management
**Goal**: Users can add physical cards, generate virtual cards from templates or custom specs, view all cards, and manage individual cards (detail view, freeze, delete)
**Depends on**: Phase 1
**Requirements**: CARD-01, CARD-02, CARD-03, CARD-04, CARD-05, CARD-06, CARD-07
**Success Criteria** (what must be TRUE):
  1. User can fill in a mock card-entry form (number, expiry, holder) to add a physical card; it appears immediately in the card list
  2. User can pick a use-case template (Groceries, SaaS, Travel, Shopping) and generate a virtual card with its preset icon, color, and default limit — or choose the fully custom option to set their own name, icon, and limit
  3. All cards display as card-style visuals with masked number, use-case label, and status badge
  4. Clicking a card opens a detail view that shows its settings, current limit usage, and recent activity
  5. User can freeze/unfreeze a card with a toggle and delete a card from the detail view or card list
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md — Card visuals + grid + freeze/delete: CardVisual, Modal/IconRenderer/cardTemplates primitives, reworked PaymentsSection grid (CARD-04/05/06)
- [x] 02-02-PLAN.md — Add physical card + generate virtual card flows: AddCardModal (physical form / template / custom) wired into PaymentsSection (CARD-01/02/03)
- [x] 02-03-PLAN.md — Card detail view: CardDetailModal with read-only settings, spend-vs-limit bar, recent activity, freeze/delete (CARD-07)
**UI hint**: yes

### Phase 3: Controls + Security Simulation
**Goal**: Users can configure per-card spending limits and MFA thresholds, then trigger a simulate-payment flow that enforces those rules — including a blocking MFA challenge when the threshold is crossed
**Depends on**: Phase 2
**Requirements**: CTRL-01, CTRL-02, CTRL-03, CTRL-04, SEC-01, SEC-02, SEC-03, SEC-04
**Success Criteria** (what must be TRUE):
  1. User can set or edit a spending limit on any card and see a spend-vs-limit progress bar update to reflect the new value
  2. User can set or edit an MFA threshold on any card and toggle MFA enforcement on or off per card
  3. Triggering "Simulate a payment" with an amount below the MFA threshold posts the transaction directly with no challenge
  4. Triggering "Simulate a payment" with an amount above the MFA threshold (and MFA on) presents an OTP/approval challenge modal that blocks the transaction until the correct simulated OTP is entered
  5. A simulated payment is rejected with a clear reason when it would exceed the card's spending limit or the card is frozen
**Plans**: TBD
**UI hint**: yes

### Phase 4: Transactions, Usage + Dashboard
**Goal**: Users can review full transaction histories (per card and combined), see which ChatGPT apps spent on each card, and get an at-a-glance payments dashboard
**Depends on**: Phase 3
**Requirements**: TXN-01, TXN-02, TXN-03, TXN-04, USAGE-01, USAGE-02, DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. User can view a per-card transaction list showing date, app/merchant, amount, and status; recurring subscriptions are visually identifiable
  2. User can view a combined transaction history across all cards in one place
  3. Simulated payments from Phase 3 appear in the relevant card's history and in the combined history immediately after posting
  4. Each card detail shows which ChatGPT connected apps used it and how much each app spent
  5. The Payments dashboard summarizes all cards, total spend vs. limits, recent transactions, and MFA/auth status across cards at a glance
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Shell + Data | 3/3 | Complete   | 2026-06-09 |
| 2. Card Management | 2/3 | In Progress|  |
| 3. Controls + Security Simulation | 0/TBD | Not started | - |
| 4. Transactions, Usage + Dashboard | 0/TBD | Not started | - |
