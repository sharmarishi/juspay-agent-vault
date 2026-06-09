---
quick_id: 260609-mcd
status: complete
date: 2026-06-09
---

# Quick Task 260609-mcd — Summary

## Bug
"Payments" appeared twice in the Payments tab (see attached screenshot): once as
the settings-shell section title and again as the section's own header.

## Root cause
`SettingsContent` renders the active nav item's label as an `<h1>` for every
section (the shell title). `PaymentsSection` additionally rendered its own
`<h2>Payments</h2>` — unlike `GeneralSection`, which relies solely on the shell
title. Result: duplicate "Payments" heading.

## Fix
`src/sections/PaymentsSection.tsx`: removed the redundant `<h2>Payments</h2>` from
the section header. Kept the subtitle ("Manage cards your ChatGPT apps use.") and
the right-side controls (Powered by Juspay + Add card). Dropped the subtitle's
`mt-1` since the heading above it is gone.

## Verification
- `npm run build` (tsc + vite) — clean.
- `npm test` — 18/18 pass.

## Notes
Executed inline (no subagents) — single-line bug fix. GSD artifacts + atomic commit
+ STATE tracking preserved.

## Human-verify
Open Payments → confirm "Payments" shows only once (top), with the subtitle and
controls below it.
