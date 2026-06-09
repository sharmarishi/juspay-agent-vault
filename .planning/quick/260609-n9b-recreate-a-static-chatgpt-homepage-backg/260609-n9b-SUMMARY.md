---
quick_id: 260609-n9b
status: complete
date: 2026-06-09
---

# Quick Task 260609-n9b — Summary

## Goal
Recreate the ChatGPT home screen as a static background behind the settings modal
(logo, sidebar, header, composer). Demo only — intentionally not interactive.

## What changed
- New `src/components/chrome/ChatGptBackground.tsx` — a static, non-interactive
  recreation of the ChatGPT home page:
  - Left rail: inline OpenAI logo SVG + new-chat / search / messages icons (lucide) + a gray avatar.
  - Top bar: "ChatGPT ⌄" on the left, "Free offer" (gift) + a small placeholder icon on the right (Juspay indigo accent).
  - Center: a rounded composer pill ("Ask anything") with a dark circular voice button.
  - Full-screen `fixed inset-0 bg-[#f9f9f9]`; sidebar hidden below `sm` to stay tidy on mobile.
- `src/App.tsx`: render `<ChatGptBackground />` then `<SettingsModal />`, so the modal's
  existing `bg-black/40` backdrop dims the chat shell behind it.

No state, no handlers, no new dependencies (uses existing lucide-react + Tailwind).

## Verification
- `npm run build` (tsc + vite) — clean.
- `npm test` — 24/24 pass.

## Notes
Executed inline (no subagents) — single static component + App wiring, kept deliberately
simple per "don't overengineer". GSD artifacts + atomic commit + STATE tracking preserved.

## Human-verify
Load the app → the settings modal now floats over a dimmed ChatGPT-style home screen
(logo, sidebar, "ChatGPT" header, "Free offer", center composer).
