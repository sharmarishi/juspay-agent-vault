---
phase: 01-shell-data
plan: "01"
subsystem: ui
tags: [react, vite, tailwind, lucide-react, typescript, settings-modal]

# Dependency graph
requires: []
provides:
  - Vite + React + TypeScript + Tailwind project scaffold
  - ChatGPT-style settings modal shell (overlay + frame, left nav + content pane)
  - Design token JUSPAY_ACCENT="#4F46E5" in src/theme/tokens.ts
  - 12-item nav including Payments section (after Apps)
  - Reusable primitives: Toggle, Dropdown, SettingRow, Callout
  - Section components: GeneralSection (with MFA callout + rows), PaymentsSection (static stub), PlaceholderSection
  - "Powered by Juspay" co-brand component
affects: [01-02, 01-03, 02-payments, 03-dashboard, 04-simulation]

# Tech tracking
tech-stack:
  added:
    - react@18.3.1
    - react-dom@18.3.1
    - lucide-react@0.469.0
    - vite@5.4.11
    - "@vitejs/plugin-react@4.3.4"
    - typescript@5.7.2
    - tailwindcss@3.4.17
    - postcss@8.4.49
    - autoprefixer@10.4.20
  patterns:
    - "Design tokens in src/theme/tokens.ts (JUSPAY_ACCENT, JUSPAY_NAME, NAV_WIDTH)"
    - "Primitives in src/components/primitives/ (Toggle, Dropdown, SettingRow, Callout)"
    - "Settings shell in src/components/settings/ (Modal, Nav, Content, navItems)"
    - "Section pages in src/sections/ (GeneralSection, PaymentsSection, PlaceholderSection)"
    - "Branding in src/components/branding/ (PoweredByJuspay)"
    - "State lifted to SettingsModal: selected section drives nav highlight and content swap"

key-files:
  created:
    - src/theme/tokens.ts
    - src/components/settings/SettingsModal.tsx
    - src/components/settings/SettingsNav.tsx
    - src/components/settings/SettingsContent.tsx
    - src/components/settings/navItems.ts
    - src/components/primitives/Toggle.tsx
    - src/components/primitives/Dropdown.tsx
    - src/components/primitives/SettingRow.tsx
    - src/components/primitives/Callout.tsx
    - src/components/branding/PoweredByJuspay.tsx
    - src/sections/GeneralSection.tsx
    - src/sections/PaymentsSection.tsx
    - src/sections/PlaceholderSection.tsx
    - src/App.tsx
    - src/main.tsx
    - src/index.css
    - package.json
    - vite.config.ts
    - tsconfig.json
    - tsconfig.node.json
    - tailwind.config.js
    - postcss.config.js
    - index.html
  modified: []

key-decisions:
  - "PaymentsSection is a static stub in this plan; data layer wired in Plan 01-03"
  - "LucideIcon type (not custom ComponentType) used in NavItem interface to satisfy TS strict mode"
  - "tsconfig.node.json uses composite:true (not noEmit) to satisfy TS project references requirement"
  - "JUSPAY_ACCENT (#4F46E5) used inline-style on Toggle ON state — Tailwind JIT cannot handle dynamic hex values"
  - "Modal is always visible (no dismiss handler) in Phase 1 — the modal IS the app entry point"

patterns-established:
  - "Design tokens: single source of truth in src/theme/tokens.ts for accent, brand name, nav width"
  - "Section routing: SettingsModal holds selected state, passes to SettingsNav (display) and SettingsContent (render)"
  - "Primitives: small, prop-driven, no internal state except Toggle (which holds checked locally when needed)"
  - "Nav items: typed NavItem[] array with LucideIcon type, imported everywhere nav data is needed"

requirements-completed: [SHELL-01, SHELL-02, SHELL-03, SHELL-04]

# Metrics
duration: 5min
completed: 2026-06-09
---

# Phase 01 Plan 01: Shell Scaffold Summary

**Vite + React + TS + Tailwind SPA scaffolded with ChatGPT-style settings modal, 12-item nav including Payments, Toggle/Dropdown/SettingRow/Callout primitives, and Juspay accent token (#4F46E5)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-06-09T06:32:44Z
- **Completed:** 2026-06-09T06:37:48Z
- **Tasks:** 3
- **Files modified:** 23

## Accomplishments

- Full Vite + React + TypeScript + Tailwind project configured and building cleanly
- ChatGPT-style settings modal shell: white rounded-2xl panel on dark overlay, left nav (260px) + content pane
- 12-item nav list matching the visual contract (General through Keyboard, with Payments inserted after Apps)
- Four reusable primitives: Toggle (ON = Juspay accent), Dropdown (pill + chevron), SettingRow (label-left/control-right), Callout (bg-gray-50 card)
- GeneralSection mirrors the screenshot (MFA callout + Appearance/Contrast/Accent/Language/Dictation/Spoken language rows)
- PaymentsSection static stub with "Powered by Juspay" co-brand mark
- PlaceholderSection for all non-Payments, non-General sections
- Juspay accent token (#4F46E5) as single source of truth in src/theme/tokens.ts

## Component Tree

```
App
└── SettingsModal                 (selected state: "general")
    ├── SettingsNav               (renders NAV_ITEMS, highlights active)
    │   └── X close button        (no-op in Phase 1)
    └── SettingsContent           (renders section by selected id)
        ├── GeneralSection        (when selected === "general")
        │   ├── Callout           (MFA prompt)
        │   ├── SettingRow × 6    (Appearance/Contrast/Accent/Language/Dictation/Spoken)
        │   ├── Dropdown          (per row)
        │   └── Toggle            (Enable Dictation)
        ├── PaymentsSection       (when selected === "payments") — STATIC STUB
        │   └── PoweredByJuspay
        └── PlaceholderSection    (all other nav items)
```

## Task Commits

1. **Task 1: Scaffold Vite + React + TS + Tailwind with design tokens** - `4af98da` (feat)
2. **Task 2: Build reusable primitives + settings modal shell** - `43df4cb` (feat)

Note: Task 3 section components were created during Task 2 execution (needed for build to compile) and included in the Task 2 commit.

## Files Created/Modified

- `src/theme/tokens.ts` — JUSPAY_ACCENT, JUSPAY_NAME, NAV_WIDTH
- `src/components/settings/SettingsModal.tsx` — overlay + frame, selected state
- `src/components/settings/SettingsNav.tsx` — icon+label nav rows, X button
- `src/components/settings/SettingsContent.tsx` — section renderer
- `src/components/settings/navItems.ts` — ordered 12-item NAV_ITEMS array
- `src/components/primitives/Toggle.tsx` — pill switch with Juspay accent ON
- `src/components/primitives/Dropdown.tsx` — pill button with chevron
- `src/components/primitives/SettingRow.tsx` — label/control row
- `src/components/primitives/Callout.tsx` — grey card with icon/title/action/X
- `src/components/branding/PoweredByJuspay.tsx` — "Powered by Juspay" inline mark
- `src/sections/GeneralSection.tsx` — General settings pane
- `src/sections/PaymentsSection.tsx` — Payments pane (static stub)
- `src/sections/PlaceholderSection.tsx` — stub for non-functional sections
- `src/App.tsx` — renders SettingsModal
- `src/main.tsx`, `src/index.css`, `index.html` — entry point
- `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json` — project config
- `tailwind.config.js`, `postcss.config.js` — CSS pipeline

## Decisions Made

- **PaymentsSection is a static stub** — no store imports, completely self-contained; data layer wired in Plan 01-03
- **LucideIcon type in NavItem interface** — Tailwind/lucide-react's `LucideIcon` type is more accurate than a custom `ComponentType<{size?, className?}>`, which fails TypeScript strict mode because lucide's `size` prop accepts `string | number`
- **tsconfig.node.json uses `composite: true`** — TS project references require this; `noEmit` is incompatible with referenced projects
- **Toggle ON color uses inline style** — Tailwind JIT cannot generate classes for a dynamic hex value (JUSPAY_ACCENT); inline `style={{ backgroundColor: JUSPAY_ACCENT }}` is the correct pattern for design-token-driven colors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error in NavItem.icon**
- **Found during:** Task 2 (build verification)
- **Issue:** Custom `ComponentType<{ size?: number; className?: string }>` was incompatible with lucide-react's `ForwardRefExoticComponent` because lucide's `size` accepts `string | number`
- **Fix:** Changed `NavItem.icon` type from custom `ComponentType` to `LucideIcon` imported from lucide-react
- **Files modified:** src/components/settings/navItems.ts
- **Verification:** `npm run build` exits 0
- **Committed in:** 43df4cb (Task 2 commit)

**2. [Rule 1 - Bug] Fixed tsconfig.node.json project reference**
- **Found during:** Task 1 (first build attempt)
- **Issue:** `noEmit: true` in tsconfig.node.json caused TS error TS6310 ("Referenced project may not disable emit") and TS6306 ("must have setting composite: true")
- **Fix:** Replaced `noEmit: true` with `composite: true`
- **Files modified:** tsconfig.node.json
- **Verification:** `npm run build` exits 0
- **Committed in:** 4af98da (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes required for TypeScript strict-mode compliance. No scope creep.

## Known Stubs

- `src/sections/PaymentsSection.tsx` — Payments pane renders static placeholder text ("Your cards will appear here."). Intentional: data layer wired in Plan 01-03.
- `src/sections/PlaceholderSection.tsx` — All non-General, non-Payments sections show stub. Intentional: out of scope per PROJECT.md.
- `src/components/settings/SettingsNav.tsx` — X close button has no-op onClick. Intentional: modal is always open in Phase 1.

## Issues Encountered

None beyond the two auto-fixed TypeScript issues above.

## User Setup Required

None — no external service configuration required. Run `npm install && npm run dev` to launch.

## Next Phase Readiness

- **Plan 01-02 (localStorage + Zustand data layer):** Project scaffold is ready. Import paths established. Token and section routing contracts defined.
- **Plan 01-03 (Payments section wired to store):** PaymentsSection stub ready to receive props; PoweredByJuspay component available for reuse.
- All primitives (Toggle, Dropdown, SettingRow, Callout) are ready for use in the Payments pane build-out.

---
*Phase: 01-shell-data*
*Completed: 2026-06-09*
