# Requirements: Juspay Agent Vault

**Defined:** 2026-06-09
**Core Value:** A user can create a use-case virtual card, set a spending limit and MFA threshold, then trigger a simulated payment that is blocked by an MFA challenge when it exceeds that threshold — proving full control over agentic payment security.

## v1 Requirements

Requirements for the initial frontend-only demo. Each maps to roadmap phases.

### Shell

- [x] **SHELL-01**: App opens to a recreated ChatGPT settings modal with left nav and content pane matching ChatGPT's clean light aesthetic
- [x] **SHELL-02**: Left nav lists the ChatGPT settings sections (General, Apps, Security, etc.) plus a new "Payments" entry; selecting Payments shows the payments experience
- [x] **SHELL-03**: Subtle Juspay co-brand is present ("Powered by Juspay" mark + Juspay accent color on payment cards) without breaking the ChatGPT look
- [x] **SHELL-04**: Layout is responsive and usable on desktop widths

### Cards

- [x] **CARD-01**: User can add a physical card via a mock card-entry form (number, expiry, holder), shown in the card list
- [x] **CARD-02**: User can generate a virtual card from a use-case template (Groceries, SaaS, Travel, Shopping), each with preset icon, color, and default limit
- [x] **CARD-03**: User can generate a fully custom virtual card (own name, icon/color, limit)
- [x] **CARD-04**: User can view all cards with a card-style visual showing masked number, use-case label, and status
- [x] **CARD-05**: User can freeze/unfreeze (toggle active) a card
- [x] **CARD-06**: User can delete a card
- [x] **CARD-07**: User can open a card detail view showing its settings, limit usage, and recent activity

### Controls

- [x] **CTRL-01**: User can set and edit a spending limit per card
- [x] **CTRL-02**: User can set and edit an MFA threshold per card (MFA required above the amount)
- [x] **CTRL-03**: User can toggle MFA on/off per card
- [x] **CTRL-04**: Card detail shows spend-against-limit progress for the current period

### Security

- [ ] **SEC-01**: User can trigger a "Simulate a payment" action from a card (amount + app/merchant)
- [ ] **SEC-02**: If the simulated amount exceeds the card's MFA threshold (and MFA is on), an OTP/approval challenge modal appears and blocks the transaction
- [ ] **SEC-03**: Entering the correct simulated OTP/approval clears the challenge and posts the transaction; cancelling aborts it
- [ ] **SEC-04**: A simulated payment is rejected if it would exceed the card's spending limit or the card is frozen, with a clear reason

### Transactions

- [ ] **TXN-01**: User can view transaction history per card (date, app/merchant, amount, status)
- [ ] **TXN-02**: User can view a combined transaction history across all cards
- [ ] **TXN-03**: Recurring subscription payments are represented and identifiable as subscriptions
- [ ] **TXN-04**: Simulated payments append to the relevant transaction histories in real time

### Usage

- [ ] **USAGE-01**: User can see, per card, which ChatGPT connected apps used it (e.g. Instacart, Booking, a SaaS tool) with spend per app
- [ ] **USAGE-02**: Each transaction is attributed to the ChatGPT app/merchant that initiated it

### Dashboard

- [ ] **DASH-01**: Payments overview summarizes all cards, total spend vs. limits, and recent transactions
- [ ] **DASH-02**: Overview surfaces auth/MFA settings status across cards at a glance

### Data

- [x] **DATA-01**: App ships with realistic seeded cards, transactions, subscriptions, and app-usage data
- [x] **DATA-02**: User changes (new cards, edited limits/thresholds, toggles, new simulated transactions) persist across refresh via localStorage
- [x] **DATA-03**: User can reset the demo to seeded state

## v2 Requirements

Deferred to future. Tracked but not in current roadmap.

### Shell

- **SHELL2-01**: Recreate the full ChatGPT chat page and account dropdown as the entry point to settings
- **SHELL2-02**: Dark mode / appearance toggle matching ChatGPT

### Security

- **SEC2-01**: Configurable MFA method choice (authenticator app vs. SMS) per the screenshots' MFA callout

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real backend / API / database | Explicitly a frontend-only demo |
| Real payment processing / card tokenization | All payments are simulated |
| Real authentication / multiple user accounts | Single mock user (Rishi Sharma) per screenshots |
| Real OTP delivery (SMS/email) | MFA challenge is simulated in-app |
| Functional non-Payments settings sections | Shell scaffolding only; not the demo's focus |
| Mobile-native apps | Web, desktop-first demo |

## Traceability

Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-01 | Phase 1 | Complete |
| SHELL-02 | Phase 1 | Complete |
| SHELL-03 | Phase 1 | Complete |
| SHELL-04 | Phase 1 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| CARD-01 | Phase 2 | Complete |
| CARD-02 | Phase 2 | Complete |
| CARD-03 | Phase 2 | Complete |
| CARD-04 | Phase 2 | Complete |
| CARD-05 | Phase 2 | Complete |
| CARD-06 | Phase 2 | Complete |
| CARD-07 | Phase 2 | Complete |
| CTRL-01 | Phase 3 | Complete |
| CTRL-02 | Phase 3 | Complete |
| CTRL-03 | Phase 3 | Complete |
| CTRL-04 | Phase 3 | Complete |
| SEC-01 | Phase 3 | Pending |
| SEC-02 | Phase 3 | Pending |
| SEC-03 | Phase 3 | Pending |
| SEC-04 | Phase 3 | Pending |
| TXN-01 | Phase 4 | Pending |
| TXN-02 | Phase 4 | Pending |
| TXN-03 | Phase 4 | Pending |
| TXN-04 | Phase 4 | Pending |
| USAGE-01 | Phase 4 | Pending |
| USAGE-02 | Phase 4 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-09*
*Last updated: 2026-06-09 after roadmap creation — all 30 requirements mapped*
