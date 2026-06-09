---
quick_id: 260609-mho
status: complete
date: 2026-06-09
---

# Quick Task 260609-mho — Summary

## Goal
Remove the Icon option (picker) from the "Create Token" (custom) section of the
Add Card modal.

## What changed
`src/components/cards/AddCardModal.tsx`:
- Removed the **Icon** `<select>` from the Create Token form. The Card color field,
  previously sharing a `grid grid-cols-2` with the icon picker, is now a full-width block.
- Removed the `customIcon` state and its `resetForm()` reset.
- Replaced the `CUSTOM_ICON_OPTIONS` list with a single `DEFAULT_TOKEN_ICON = "Sparkles"`
  constant. Created tokens and the live preview now use this fixed icon
  (`icon: DEFAULT_TOKEN_ICON` in the `addCard` payload; preview `<IconRenderer>` uses it too).

No behavior change beyond the removed picker — tokens still get a valid icon by default.

## Verification
- `npm run build` (tsc + vite) — clean (no leftover `customIcon`/`CUSTOM_ICON_OPTIONS` refs).
- `npm test` — 18/18 pass.

## Notes
Executed inline (no subagents) — small, well-scoped UI removal. GSD artifacts +
atomic commit + STATE tracking preserved.

## Human-verify
Open "Add card" → "Create Token" → confirm there's no Icon dropdown; Card color is
full-width; the live preview shows the default (Sparkles) icon; creating a token works.
