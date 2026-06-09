---
quick_id: 260609-mfs
status: complete
date: 2026-06-09
---

# Quick Task 260609-mfs — Summary

## Goal
In the Add Card modal's mode switcher:
1. Rename "Custom token" → "Create Token"
2. Rename "From template" → "Token Templates"
3. Move "Token Templates" from the 2nd to the 3rd tab.

## What changed
`src/components/cards/AddCardModal.tsx` (mode switcher):
- Tab order array `["physical", "template", "custom"]` → `["physical", "custom", "template"]`
  so the tabs render: **Card · Create Token · Token Templates**.
- Labels: `custom: "Custom token"` → `"Create Token"`; `template: "From template"` → `"Token Templates"`.

Mode keys (`physical`/`template`/`custom`) are unchanged, so all per-mode conditional
rendering and submit handlers still work. Default mode remains `physical` (1st tab).

## Verification
- `npm run build` (tsc + vite) — clean.
- `npm test` — 18/18 pass.

## Notes
Executed inline (no subagents) — trivial label + reorder change. GSD artifacts +
atomic commit + STATE tracking preserved.

## Human-verify
Open "Add card" → confirm tabs read **Card · Create Token · Token Templates** in that
order, and each tab still shows its correct form.
