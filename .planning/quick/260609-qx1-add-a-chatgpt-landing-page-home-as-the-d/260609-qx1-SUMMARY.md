---
phase: quick-260609-qx1
plan: 01
subsystem: chrome + settings
tags: [landing-page, settings-modal, controlled-modal, routing]
dependency_graph:
  requires: [chrome/LandingPage, settings/SettingsModal, settings/SettingsNav, settings/SettingsContent]
  provides: [landing-first app flow, controlled closable settings modal]
  affects: [App.tsx, all settings sections, mobile nav drawer]
tech_stack:
  added: []
  patterns: [controlled modal via open/onClose props, prop separation (onClose=drawer vs onCloseModal=modal)]
key_files:
  created:
    - src/components/chrome/LandingPage.tsx
  modified:
    - src/App.tsx
    - src/components/settings/SettingsModal.tsx
    - src/components/settings/SettingsNav.tsx
    - src/components/settings/SettingsContent.tsx
decisions:
  - "git mv used for ChatGptBackground.tsx → LandingPage.tsx to preserve history"
  - "SettingsNav keeps onClose (drawer) + onCloseModal (modal) as distinct props — critical to avoid conflation"
  - "SettingsModal returns null when !open (not display:none) — clean unmount/remount on open/close"
  - "Backdrop onClick={onClose} + panel onClick stopPropagation — standard modal dismiss pattern"
metrics:
  duration: ~10 minutes
  completed: "2026-06-09"
  tasks: 4
  files: 5
---

# Quick Task 260609-qx1: Add ChatGPT Landing Page as Default View — Summary

**One-liner:** Landing-first ChatGPT home with full sidebar, settings entry points (desktop gear+Demo pill + mobile gear+Demo pill), and a controlled closable SettingsModal (open/onClose props, backdrop dismiss, mobile X).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build foreground LandingPage (rename + expand ChatGptBackground) | 4d60c50 | src/components/chrome/LandingPage.tsx |
| 2 | Make SettingsModal controlled + closable | f08c59a | SettingsModal.tsx, SettingsNav.tsx, SettingsContent.tsx |
| 3 | Wire App.tsx — landing-first with settingsOpen state | ff1d230 | src/App.tsx |
| 4 | Human verify checkpoint | — | (auto-approved; manual steps below) |

## What Was Built

### LandingPage (`src/components/chrome/LandingPage.tsx`)

Renamed from `ChatGptBackground.tsx` via `git mv` (history preserved). Expanded from a minimal icon rail into a full ChatGPT-style home:

- **Left sidebar (desktop, `sm:flex w-[260px]`):** OpenAI logo + PanelLeft collapse icon; Settings button (gear + "Settings" label + indigo "Demo" pill) as the primary entry point; nav items (New chat, Search, Library, Projects, Apps, Codex, More); Recents section with 5 sample chat titles; pinned bottom user profile (avatar, "Rishi Sharma" / "Free", "Claim offer" button).
- **Top bar:** Mobile-only gear + Demo pill button (Settings entry, `sm:hidden`); "ChatGPT ⌄" title; "Free offer" + dashed square.
- **Center:** "What's on your mind today?" heading; composer pill (Plus / "Ask anything" / SlidersHorizontal / AudioLines); 3 action chips (Create an image, Write or edit, Look something up).
- Responsive: sidebar hidden on mobile; chips wrap; heading + composer centered.

### Controlled SettingsModal

- Props: `{ open: boolean; onClose: () => void }` — returns `null` when `!open`.
- Backdrop `onClick={onClose}`, panel `onClick={(e) => e.stopPropagation()}`.
- Passes `onCloseModal={onClose}` to SettingsNav (desktop X) and `onClose={onClose}` to SettingsContent (mobile X).

### SettingsNav — prop separation

- Added `onCloseModal: () => void` (distinct from `onClose` which closes the mobile drawer).
- Desktop X: `onClick={onCloseModal}` — closes the modal.
- Mobile drawer X: `onClick={onClose}` — closes the drawer only.

### SettingsContent — mobile X

- Added `onClose: () => void` prop (closes modal).
- Mobile header now has hamburger (left) + title + X (right, `md:hidden ml-auto`).

### App.tsx

```tsx
const [settingsOpen, setSettingsOpen] = useState(false); // default: landing page shown
<LandingPage onOpenSettings={() => setSettingsOpen(true)} />
<SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
```

## Deviations from Plan

None — plan executed exactly as written.

## Build + Test Results

```
npm run build  → clean (tsc + vite, no errors)
npm test       → 24/24 tests passing (2 test files)
```

## Manual Verification Steps (for human reviewer)

Run `npm run dev` and open the app.

**Desktop (full width):**
1. App lands on the ChatGPT-style home — NO settings modal visible by default.
2. Top-left of the sidebar shows a "Settings" button (gear) with a subtle indigo "Demo" pill beside it.
3. Click Settings → the settings modal opens over the (blurred) landing page.
4. Close via the desktop X (top of the settings sidebar) → returns to landing.
5. Open again, click the dark backdrop OUTSIDE the white panel → closes. Clicking INSIDE the panel does NOT close it.
6. Confirm Payments, Shopping, and Subagents content still work; Demo nav tags still show.

**Mobile (resize to 375px):**
7. Sidebar hidden; a gear + "Demo" pill appears in the top bar (left) — tap it → settings opens (near full-screen).
8. Mobile nav drawer (hamburger) still slides in from left and lets you pick sections.
9. Close the modal via the X in the mobile header → returns to the landing page.
10. Landing heading + composer centered/usable; action chips wrap nicely.

## Known Stubs

None — all entry points are wired to live state.

## Self-Check: PASSED

- `src/components/chrome/LandingPage.tsx` exists: FOUND
- `src/App.tsx` contains `settingsOpen`: FOUND
- Commits 4d60c50, f08c59a, ff1d230: FOUND
