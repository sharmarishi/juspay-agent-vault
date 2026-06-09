---
quick_id: 260609-lfl
title: Make the site mobile-friendly / responsive
completed: 2026-06-09
duration_minutes: ~15
tasks_completed: 3
tasks_total: 3
files_modified: 8
commits:
  - hash: 4ea4de1
    message: "feat(260609-lfl): make settings modal shell responsive"
  - hash: 724f1c4
    message: "feat(260609-lfl): make Payments content surfaces reflow on mobile"
  - hash: 5a109a6
    message: "feat(260609-lfl): make card modals near-full-screen on mobile"
key_files_modified:
  - src/components/settings/SettingsModal.tsx
  - src/components/settings/SettingsNav.tsx
  - src/components/settings/SettingsContent.tsx
  - src/sections/PaymentsSection.tsx
  - src/components/primitives/Modal.tsx
  - src/components/cards/CardDetailModal.tsx
  - src/components/cards/SimulatePaymentModal.tsx
decisions:
  - "Mobile nav: horizontal scrollable strip (not dropdown) — keeps all sections one tap away with zero new state"
  - "NAV_WIDTH inline style removed from SettingsNav; replaced with md:w-[260px] Tailwind arbitrary value — import cleaned up to avoid tsc unused-import warning"
  - "Modal primitive widthClass now only applies at md+; all per-modal widthClass overrides updated to md: prefix so mobile stays full-width"
---

# Quick Task 260609-lfl: Make the site mobile-friendly / responsive

**One-liner:** Additive mobile-first Tailwind layout across the settings shell, Payments tab content, and all three card modals — full-screen on 375px, pixel-identical on md+.

## What was done

### Task 1 — Settings modal shell responsive (commits: 4ea4de1)

**SettingsModal.tsx:**
- Backdrop: `flex items-stretch justify-stretch md:items-center md:justify-center` — full-bleed on mobile, centered card on desktop
- Panel: removed inline `style` width/height object; replaced with mobile-first `w-full h-full md:h-auto md:w-[min(900px,calc(100vw-48px))] md:min-h-[600px] md:max-h-[calc(100vh-48px)] md:rounded-2xl`
- Layout direction: `flex flex-col md:flex-row` — nav stacks above content on mobile, side-by-side on desktop
- Divider: `h-px w-full md:h-auto md:w-px` — horizontal hairline on mobile, vertical hairline on desktop

**SettingsNav.tsx:**
- Removed `style={{ width: NAV_WIDTH }}` and the now-unused `NAV_WIDTH` import
- Outer wrapper: `flex flex-row md:flex-col ... overflow-x-auto md:overflow-x-visible md:overflow-y-auto py-2 md:py-4 md:w-[260px]`
- X button row: `hidden md:flex` — hidden on mobile (modal fills screen, close is irrelevant)
- Nav: `flex flex-row md:flex-col gap-0.5`
- Each button: added `flex-shrink-0 whitespace-nowrap`; scoped `w-full text-left` to `md:w-full md:text-left`

**SettingsContent.tsx:**
- `p-8` → `p-4 md:p-8` (32px padding too wide on a 375px phone)

### Task 2 — Payments content surfaces reflow (commit: 724f1c4)

**PaymentsSection.tsx:**
- Tab bar: added `overflow-x-auto`; each tab button: added `flex-shrink-0 whitespace-nowrap`
- Card action row: added `flex-wrap` so freeze/delete/confirm pills wrap instead of overflowing

**Verified no changes needed:**
- `DashboardOverview.tsx` — stat tiles already `grid-cols-1 sm:grid-cols-3`; transaction rows already `min-w-0` + `shrink-0` + `truncate`
- `TransactionsList.tsx` — filter pills fit at 375px; rows already overflow-safe
- `AppUsageBreakdown.tsx` — rows already `justify-between gap-2 min-w-0 shrink-0`

### Task 3 — Card modals near-full-screen on mobile (commit: 5a109a6)

**Modal.tsx (primitive):**
- Backdrop: `flex items-stretch justify-stretch md:items-center md:justify-center`
- Panel: mobile-first full-screen base `w-full h-full p-4` with desktop restore `md:h-auto md:rounded-2xl md:max-h-[calc(100vh-48px)] md:p-6`
- Default `widthClass` fallback: `md:w-[min(520px,calc(100vw-48px))]` (md: prefixed — mobile stays full-width)

**CardDetailModal.tsx:**
- `widthClass`: `w-[min(560px,calc(100vw-48px))]` → `md:w-[min(560px,calc(100vw-48px))]`
- Tab bar: added `overflow-x-auto`; each tab button: added `flex-shrink-0 whitespace-nowrap`

**SimulatePaymentModal.tsx:**
- `widthClass`: `w-[min(440px,calc(100vw-48px))]` → `md:w-[min(440px,calc(100vw-48px))]`

**AddCardModal.tsx:** No change — uses default widthClass, now automatically `md:`-prefixed via the primitive.

## Build and Test Results

```
npm run build  →  tsc + vite build: PASSED (0 errors, 0 type errors)
npm test       →  18 tests in 2 files: PASSED
```

## Decisions Made

1. **Mobile nav pattern:** Horizontal scrollable strip chosen over a dropdown — keeps all nav sections one tap away, zero new JS state required, recovers well at any nav item count.

2. **NAV_WIDTH removal:** The `NAV_WIDTH = 260` constant was only used as an inline style on SettingsNav. Removing the import keeps tsc clean and the Tailwind arbitrary `md:w-[260px]` is the authoritative source for the sidebar width.

3. **widthClass at md+ only:** All per-modal widthClass strings were unprefixed (`w-[min(...)]`), which would have constrained mobile to a narrow floating card even with the primitive's new full-screen base. Updated all callers to `md:`-prefix so the mobile baseline of `w-full h-full` actually applies.

## Deviations from Plan

None — plan executed exactly as written. All prescribed changes applied; all "verify only" surfaces confirmed overflow-safe without modification.

## Manual Verification Steps

These steps document the expected mobile/desktop behavior for human QA:

**Mobile (375px — Chrome devtools device toolbar, iPhone SE preset):**
1. Open app. Settings modal fills the viewport entirely (no black margins).
2. Nav section appears as a horizontal scrollable strip at the top — General, Payments, etc. in a row.
3. No horizontal page scroll anywhere in the shell.
4. Go to Payments → Overview/Cards/Transactions tabs — all content within viewport width.
5. Cards tab: card grid is single column; action pills (Freeze/Delete) wrap if needed.
6. Tap "+ Add card" — modal fills the screen, all three mode pills visible (may wrap), inputs tappable.
7. Close. Tap a card → Detail modal fills the screen; "Virtual cards / Controls / Used by apps" tab bar scrolls horizontally.
8. Tap "Simulate a payment" → modal fills the screen; complete payment/MFA challenge end-to-end.

**Desktop regression (≥768px):**
1. SettingsModal: centered 900px card with `rounded-2xl`, 260px vertical left sidebar, `p-8` content padding — identical to pre-change.
2. AddCardModal: 520px floating card with `rounded-2xl`, `p-6` padding.
3. CardDetailModal: 560px floating card.
4. SimulatePaymentModal: 440px floating card.

## Known Stubs

None — no new stubs introduced.

## Self-Check: PASSED
