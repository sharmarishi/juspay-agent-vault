<!-- GSD:project-start source:PROJECT.md -->
## Project

**Juspay Agent Vault**

A frontend-only demo of a payment management experience embedded inside ChatGPT's
Settings, built for Juspay (a payment orchestrator). It recreates the ChatGPT
settings modal and adds a **Payments** section where users securely add physical
and virtual cards, generate use-case-specific virtual cards (groceries, SaaS,
travel…), set per-card spending limits and MFA thresholds, simulate payments to
demonstrate the security flow, and review a dashboard of transactions, limits,
auth settings, and per-card usage across ChatGPT's connected apps. No backend —
all behavior is simulated client-side with seeded data persisted in localStorage.

**Core Value:** A user can create a use-case virtual card, set a spending limit and an MFA
threshold on it, then trigger a simulated payment that is blocked by an MFA
challenge when it exceeds that threshold — proving they are in full control of
their agentic payment security.

### Constraints

- **Tech stack**: React + Vite + Tailwind CSS — fast client SPA and utility CSS to closely match the clean ChatGPT look
- **Architecture**: Frontend only, no backend — all state simulated client-side
- **Persistence**: Seeded demo data + localStorage for user changes (survives refresh)
- **Fidelity**: Recreate the full ChatGPT settings modal shell (not just the payments pane) for a realistic demo
- **Security UX**: MFA threshold behavior must be *demonstrable* via a simulated challenge, not just configurable
- **Branding**: Subtle co-brand only — keep ChatGPT's neutral aesthetic; add a tasteful Juspay mark and accent
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
