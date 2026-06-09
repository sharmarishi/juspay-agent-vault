---
quick_id: 260609-o5k
status: complete
date: 2026-06-09
---

# Quick Task 260609-o5k — Summary

## Goal
Highlight the demo-relevant nav sections ("Payments" and "Shopping") with a subtle tag.

## What changed
- `src/components/settings/navItems.ts`: added an optional `tag?: string` field to
  `NavItem`; set `tag: "Demo"` on the Payments and Shopping items.
- `src/components/settings/SettingsNav.tsx`: the nav row renders the tag as a small
  right-aligned pill (`ml-auto`, `bg-indigo-50 text-indigo-600 border-indigo-100`,
  text-[10px]) — a subtle Juspay-accent tint. Shows in both the desktop sidebar and the
  mobile drawer (shared nav list).

## Verification
- `npm run build` (tsc + vite) — clean.
- `npm test` — 24/24 pass.

## Notes
Executed inline (no subagents) — small additive UI highlight. GSD artifacts + atomic
commit + STATE tracking preserved. Data-driven via the `tag` field, so other items can
be tagged later without touching the render.

## Human-verify
Settings nav → "Payments" and "Shopping" each show a subtle indigo "Demo" pill (desktop
sidebar and mobile drawer).
