---
quick_id: 260609-n5b
status: complete
date: 2026-06-09
---

# Quick Task 260609-n5b — Summary

## Goal
Add the "Which Subagents can access this card" selector to the physical **Card**
entry flow (it previously only appeared in the Token / virtual creation modes).

## What changed
`src/components/cards/AddCardModal.tsx`:
- Rendered the existing `<SubagentSelector />` in the physical-mode form (after the
  "Only the last 4 digits are stored" note, before the submit button).
- `handlePhysicalSubmit` now persists `subagentIds: selectedSubagentIds` instead of `[]`.

Reused the existing shared `SubagentSelector` and `selectedSubagentIds` state — no
new state, and `resetForm` already clears it.

## Verification
- `npm run build` (tsc + vite) — clean.
- `npm test` — 24/24 pass.

## Notes
Executed inline (no subagents) — small additive UI change. GSD artifacts + atomic
commit + STATE tracking preserved.

## Human-verify
Add card → physical "Card" tab → confirm the Subagent chips appear and the selected
subagents persist onto the created card (visible in the card detail "Subagent access").
