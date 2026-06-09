---
phase: quick-260609-rad
plan: "01"
subsystem: settings-shell
tags: [mobile-ux, settings, responsive, master-detail]
dependency_graph:
  requires: []
  provides: [mobile-full-screen-settings]
  affects: [SettingsModal, SettingsNav, SettingsContent]
tech_stack:
  added: []
  patterns: [mobile-master-detail, responsive-branch-gating]
key_files:
  created: []
  modified:
    - src/components/settings/SettingsModal.tsx
    - src/components/settings/SettingsNav.tsx
    - src/components/settings/SettingsContent.tsx
decisions:
  - "Mobile branch gated md:hidden and desktop branch gated hidden md:flex — two sibling divs in a fragment rather than a single combined root; eliminates the single root that was carrying both mobile and desktop classes"
  - "Shared renderSection() helper in SettingsModal avoids duplicating the general/payments/shopping/PlaceholderSection mapping; SettingsContent remains self-contained with its own copy (single-file desktop-only component, duplication is minimal and acceptable)"
  - "useEffect resets mobileView to 'list' on open — hooks declared before if(!open) return null to satisfy rules of hooks"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-09T14:13:00Z"
  tasks_completed: 3
  files_modified: 3
---

# Quick Task 260609-rad: Unify Mobile Settings UX into Full-Screen Master-Detail

**One-liner:** Mobile Settings replaced with native-app-style full-screen list→detail flow (NAV_ITEMS rows with Demo pills + ChevronRight, back/close header on detail); desktop two-pane centered modal retained unchanged via `hidden md:flex` gate.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | SettingsContent → desktop-only h1 + body | e85e6d2 | SettingsContent.tsx |
| 2 | SettingsNav → desktop sidebar only | e85e6d2 | SettingsNav.tsx |
| 3 | SettingsModal → mobile full-screen master-detail + retained desktop branch | e85e6d2 | SettingsModal.tsx |

## What Was Built

### SettingsContent (Task 1)
Stripped to a pure desktop-only surface. Props reduced from `{ selected, onOpenNav, onClose }` to `{ selected }` only. Removed `Menu` import, hamburger button, and mobile X button. Padding simplified from `p-4 md:p-8` to `p-8` (desktop-only component). The `renderBody()` logic is unchanged.

### SettingsNav (Task 2)
Removed the entire `md:hidden` mobile drawer block — scrim, sliding panel, "Settings" header, drawer X button. Removed `open` and `onClose` props. Now a pure desktop sidebar (`hidden md:flex`) with the X close button calling `onCloseModal`. `navList` (icon + label + Demo tag pill + active bg) is unchanged.

### SettingsModal (Task 3)
Replaced the single combined root with two sibling branches in a fragment:

**Desktop branch** (`hidden md:flex`): Centered modal with backdrop-blur, click-outside-to-close, inner panel with `SettingsNav + divider + SettingsContent`. Visually identical to before; SettingsNav/SettingsContent now receive trimmed props.

**Mobile branch** (`md:hidden`): Full-screen `fixed inset-0 bg-white flex flex-col`. Two views driven by `mobileView: "list" | "detail"` state:
- **List view**: Header (h1 "Settings" + X close), scrollable body with `NAV_ITEMS` rows — each row has icon, label, optional Demo pill, and `ChevronRight`. Row tap calls `handleSelect(id)` which sets `selected` + `mobileView="detail"`.
- **Detail view**: Header (`ChevronLeft` back → `"list"` + title + `X` close), body with `flex-1 min-h-0 overflow-y-auto p-4 flex flex-col` wrapping `renderSection(selected, title)`. The `flex flex-col` parent ensures `ShoppingSection`'s `flex-1 min-h-0` fill+scroll works correctly.

`useEffect(() => { if (open) setMobileView("list"); }, [open])` resets to list on every open. Hooks declared before `if (!open) return null` (rules of hooks compliant).

## Verification Results

### Automated
- `npm run build`: tsc strict + vite build — **CLEAN** (no type errors, no warnings except existing chunk-size advisory)
- `npm test`: **24/24 tests green** (2 test files)

### Manual Verification Steps (for human checkpoint)
1. `npm run dev`, open at 375px width (DevTools device toolbar).
2. Tap Settings → full-screen List: "Settings" h1 left, X right, NAV_ITEMS rows with chevrons; Payments and Shopping show indigo "Demo" pill.
3. Tap "Payments" → full-screen Detail: ChevronLeft back + "Payments" title left, X right; body scrolls.
4. Tap "Shopping" → chat experience fills and scrolls (ShoppingSection flex-1 fill verified by flex-col parent + flex-1 min-h-0 overflow-y-auto body wrapper).
5. Back arrow → returns to List screen.
6. X (from either view) → closes settings back to home.
7. Re-open Settings → always resets to List (not last detail).
8. Confirm: NO centered card, NO blurred backdrop, NO hamburger/drawer on mobile.
9. Resize to ≥768px (md): centered two-pane modal unchanged — sidebar nav with X, single h1 title, backdrop-click closes, panel click does not close.

## Deviations from Plan

None — plan executed exactly as written.

All three tasks implemented in a single commit (`e85e6d2`) since Tasks 1 and 2 produced build errors until Task 3 completed (SettingsModal was still passing old props to SettingsContent/SettingsNav during intermediate state). The logical task boundaries are preserved; the commit message documents all three changes.

## Known Stubs

None.

## Self-Check: PASSED

- `src/components/settings/SettingsModal.tsx` — FOUND
- `src/components/settings/SettingsNav.tsx` — FOUND
- `src/components/settings/SettingsContent.tsx` — FOUND
- commit `e85e6d2` — FOUND
- build: clean
- tests: 24/24 green
