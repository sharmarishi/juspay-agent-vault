# Juspay Agent Vault

## What This Is

A frontend-only demo of a payment management experience embedded inside ChatGPT's
Settings, built for Juspay (a payment orchestrator). It recreates the ChatGPT
settings modal and adds a **Payments** section where users securely add physical
and virtual cards, generate use-case-specific virtual cards (groceries, SaaS,
travel…), set per-card spending limits and MFA thresholds, simulate payments to
demonstrate the security flow, and review a dashboard of transactions, limits,
auth settings, and per-card usage across ChatGPT's connected apps. No backend —
all behavior is simulated client-side with seeded data persisted in localStorage.

## Core Value

A user can create a use-case virtual card, set a spending limit and an MFA
threshold on it, then trigger a simulated payment that is blocked by an MFA
challenge when it exceeds that threshold — proving they are in full control of
their agentic payment security.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Recreate the ChatGPT settings modal shell (left nav + content pane) with a new "Payments" section, matching ChatGPT's clean light aesthetic
- [ ] Add and manage physical cards (mock card entry); display them with the same controls as virtual cards
- [ ] Generate virtual cards per use-case from templates (Groceries, SaaS, Travel, Shopping) — each with icon, color, and sensible default limit — plus a fully custom option
- [ ] Set and edit a spending limit per card
- [ ] Set and edit an MFA threshold per card (MFA required above the configured amount)
- [ ] Toggle card features on/off per card (e.g. card active/frozen, MFA on/off)
- [ ] Simulate a payment from a card; if the amount exceeds the card's MFA threshold, present an OTP/approval challenge that must be cleared before the transaction posts
- [ ] View transaction history per card and across all cards, including recurring subscription payments
- [ ] View per-card usage attributed to ChatGPT connected apps (which app spent on which card)
- [ ] Comprehensive payments dashboard summarizing cards, spend vs. limits, transactions, and auth settings
- [ ] Subtle Juspay co-brand ("Powered by Juspay" + accent color on payment cards) within the neutral ChatGPT styling
- [ ] Seed realistic demo data; persist user changes (cards, limits, toggles, transactions) across refresh via localStorage

### Out of Scope

- Real backend / API / database — explicitly a frontend-only demo
- Real payment processing or real card tokenization — all payments are simulated
- Real authentication / user accounts — single mock user (Rishi Sharma, per screenshots)
- Real OTP delivery (SMS/email) — the MFA challenge is simulated in-app
- Mobile-native apps — web demo only (responsive desktop-first)
- Building out the non-Payments ChatGPT settings sections beyond visual presence in the nav — they are shell scaffolding, not functional

## Context

- **Reference UI:** Three ChatGPT screenshots in `chatgpt screenshots/` show (1) the main chat page with account dropdown, (2) the account/help menu, and (3) the Settings modal — left nav (General, Notifications, Personalization, Apps, Data controls, Storage, Security, Parental controls, Trusted contact, Account, Keyboard), a "Secure your account (MFA)" callout card, and rows like Appearance/Contrast/Accent color with dropdowns and toggle switches. These define the visual language to match.
- **Domain:** Agentic commerce — cards used by AI agents / connected apps inside ChatGPT. "Apps" maps to ChatGPT's connected apps concept (e.g. Instacart, Booking, Expedia, a SaaS tool), and each is attributed as the initiator of a payment.
- **Purpose:** Demo to showcase Juspay's vision for in-ChatGPT payment management; must feel intuitive, secure, and give robust user control. Simple surface, deeply functional underneath.

## Constraints

- **Tech stack**: React + Vite + Tailwind CSS — fast client SPA and utility CSS to closely match the clean ChatGPT look
- **Architecture**: Frontend only, no backend — all state simulated client-side
- **Persistence**: Seeded demo data + localStorage for user changes (survives refresh)
- **Fidelity**: Recreate the full ChatGPT settings modal shell (not just the payments pane) for a realistic demo
- **Security UX**: MFA threshold behavior must be *demonstrable* via a simulated challenge, not just configurable
- **Branding**: Subtle co-brand only — keep ChatGPT's neutral aesthetic; add a tasteful Juspay mark and accent

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite + Tailwind | Closest fit to recreate the clean ChatGPT settings UI quickly | — Pending |
| Recreate full settings modal shell | Most realistic demo; Payments reads as a native ChatGPT section | — Pending |
| Simulated MFA challenge flow ("Simulate a payment") | No backend; security must be shown working, not just set | — Pending |
| Use-case templates + custom virtual cards | Matches the "customize by use case" brief with low-friction creation | — Pending |
| Physical cards added/managed, virtual cards generated | Mirrors real distinction between linking a bank card vs. issuing a virtual one | — Pending |
| Per-card usage attributed to ChatGPT connected apps | "Used across apps" is the differentiating agentic-commerce feature | — Pending |
| Seeded data + localStorage persistence | Demo feels alive immediately and remembers user changes | — Pending |
| Subtle Juspay co-brand | Keep native ChatGPT feel while crediting Juspay | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-09 after initialization*
