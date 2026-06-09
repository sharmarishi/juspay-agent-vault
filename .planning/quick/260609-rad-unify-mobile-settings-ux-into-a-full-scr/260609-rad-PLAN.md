---
phase: quick-260609-rad
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/settings/SettingsModal.tsx
  - src/components/settings/SettingsNav.tsx
  - src/components/settings/SettingsContent.tsx
autonomous: false
requirements: [MOBILE-UX-01]
must_haves:
  truths:
    - "On mobile (<md), tapping Settings opens a full-screen List screen (no centered card, no backdrop blur)"
    - "The mobile List screen shows all NAV_ITEMS as full-width rows with icon + label + Demo tag (where present) + a right chevron"
    - "Tapping a mobile list row pushes to a full-screen Detail screen showing that section's content"
    - "The mobile Detail header has a back arrow (left) + section title and a close X (right); back returns to List, X closes settings"
    - "The mobile Detail body scrolls (tall sections like Payments/Shopping fill and scroll correctly)"
    - "Opening settings always resets to the List screen"
    - "Desktop (md+) is UNCHANGED: centered two-pane modal, backdrop-click close, sidebar X close, single h1 title"
    - "The old mobile hamburger drawer and mobile X-in-content chrome are gone"
  artifacts:
    - path: "src/components/settings/SettingsModal.tsx"
      provides: "Mobile full-screen master-detail (list|detail) branch + retained desktop centered modal branch"
      contains: "mobileView"
    - path: "src/components/settings/SettingsNav.tsx"
      provides: "Desktop-only sidebar (drawer block removed)"
    - path: "src/components/settings/SettingsContent.tsx"
      provides: "Desktop h1 + body only (hamburger + mobile X removed, h1 hidden on mobile)"
  key_links:
    - from: "src/components/settings/SettingsModal.tsx"
      to: "mobileView state"
      via: "row tap sets selected + mobileView='detail'; back sets 'list'; X calls onClose; open resets to 'list'"
      pattern: "mobileView"
    - from: "src/components/settings/SettingsModal.tsx detail body"
      to: "ShoppingSection flex-1 fill"
      via: "flex-1 min-h-0 overflow-y-auto detail body wrapper"
      pattern: "flex-1 min-h-0"
---

<objective>
Unify the MOBILE (<md) settings experience into ONE native-app-style full-screen master-detail flow,
replacing the two disjoint surfaces that exist today (a web-style centered popup PLUS a hamburger-triggered
left nav drawer). Desktop (md+) stays exactly as it is: the centered two-pane modal.

Purpose: The current mobile flow stacks a modal and a nested drawer — confusing and un-native. The finalized
UX is a full-screen List screen (NAV_ITEMS as rows) that pushes to a full-screen Detail screen (section
content), matching the canonical mobile settings pattern (List → Detail push, X top-right, Back top-left).

Output: Refactored SettingsModal (mobile master-detail + retained desktop branch), simplified SettingsNav
(desktop sidebar only), and simplified SettingsContent (desktop h1 + body only).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md
@src/components/settings/SettingsModal.tsx
@src/components/settings/SettingsNav.tsx
@src/components/settings/SettingsContent.tsx
@src/components/settings/navItems.ts
@src/sections/ShoppingSection.tsx

<interfaces>
<!-- Contracts the executor must respect. No further codebase exploration needed. -->

App.tsx renders (KEEP AS-IS — do NOT modify App.tsx):
```tsx
<SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
```
So SettingsModal's public props MUST remain exactly: { open: boolean; onClose: () => void }.

NAV_ITEMS (src/components/settings/navItems.ts):
```ts
export interface NavItem { id: string; label: string; icon: LucideIcon; tag?: string; }
export const NAV_ITEMS: NavItem[];  // e.g. payments/shopping carry tag: "Demo"
```

Demo tag pill styling (reuse verbatim):
  bg-indigo-50 text-indigo-600 border border-indigo-100  (text-[10px] font-medium rounded-full px-1.5 py-0.5)

Section render mapping (currently inside SettingsContent.renderBody — this logic moves with the rework):
  general  → <GeneralSection />
  payments → <PaymentsSection />
  shopping → <ShoppingSection />
  default  → <PlaceholderSection label={title} />

ShoppingSection root is `flex flex-col flex-1 min-h-0` — its detail body wrapper MUST be a flex column with
`flex-1 min-h-0 overflow-y-auto` so the section fills and scrolls correctly (same requirement as desktop today).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: SettingsContent → desktop-only h1 + body (drop hamburger + mobile X)</name>
  <files>src/components/settings/SettingsContent.tsx</files>
  <action>
Simplify SettingsContent to a DESKTOP-ONLY presentation surface (it is only rendered inside the desktop
centered modal after this rework; mobile gets its own header owned by SettingsModal).

- Remove the `onOpenNav` and `onClose` props from SettingsContentProps. Keep only `{ selected: string }`.
- Remove the `Menu` import and the hamburger button; remove the mobile X button. Keep the `X` import ONLY if
  still used (it is not — drop it).
- Keep the title computation (activeItem.label) and the `renderBody()` mapping unchanged
  (general/payments/shopping/PlaceholderSection).
- Header: render the h1 title as before, but it should be visible on desktop. Since this component is now
  desktop-only (rendered inside the `hidden md:flex` desktop branch), the h1 can stay as
  `<h1 className="text-xl font-semibold text-gray-900 mb-6">{title}</h1>` with no mobile-specific buttons.
  Per finalized UX, the desktop h1 is the single title; the mobile detail header (owned by SettingsModal)
  is the mobile title — so add `hidden md:block` defensiveness is NOT required here because SettingsContent
  is no longer mounted on mobile, but keep the root container as a normal flex column body
  (`flex flex-col flex-1 p-8 overflow-y-auto`) — drop the `p-4 md:p-8` responsive padding in favor of `p-8`.
- Net: SettingsContent renders { h1 title, renderBody() } only. No menu, no close, no mobile branches.

Reference: current renderBody() body in the existing file — copy it verbatim into the simplified component.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>SettingsContent compiles with props `{ selected }` only; no Menu/hamburger, no mobile X; h1 + renderBody render on desktop. tsc clean.</done>
</task>

<task type="auto">
  <name>Task 2: SettingsNav → desktop sidebar only (drop mobile drawer block)</name>
  <files>src/components/settings/SettingsNav.tsx</files>
  <action>
Reduce SettingsNav to the DESKTOP sidebar only — the mobile drawer (scrim + sliding panel + "Settings"
header) is superseded by SettingsModal's full-screen list and must be removed.

- Update SettingsNavProps to `{ selected: string; onSelect: (id: string) => void; onCloseModal: () => void }`.
  Remove `open` and `onClose` (drawer-only props).
- Remove the entire mobile drawer JSX block (the `md:hidden fixed inset-0 z-[70]` wrapper with scrim and the
  sliding panel). Keep ONLY the desktop sidebar block (`hidden md:flex md:flex-col ... md:w-[260px]`) with its
  top X button (onClick={onCloseModal}) and the `navList`.
- Keep `navList` exactly as-is (icon + label + Demo tag pill + active bg-gray-100). Keep the `X` import (still
  used by the desktop X button).
- Net: SettingsNav is a pure desktop sidebar. No drawer, no scrim, no open/onClose.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>SettingsNav exports a desktop-only sidebar; props are `{ selected, onSelect, onCloseModal }`; no md:hidden drawer block remains. tsc clean.</done>
</task>

<task type="auto">
  <name>Task 3: SettingsModal → mobile full-screen master-detail + retained desktop branch</name>
  <files>src/components/settings/SettingsModal.tsx</files>
  <action>
Rework SettingsModal to render TWO mutually-exclusive responsive branches. Public props UNCHANGED: `{ open, onClose }`.

State:
- Keep `const [selected, setSelected] = useState("general")`.
- Replace `navOpen` with `const [mobileView, setMobileView] = useState<"list" | "detail">("list")`.
- Reset to list whenever settings (re)opens: `useEffect(() => { if (open) { setMobileView("list"); } }, [open])`.
  (Import useEffect.)
- Early-return null when `!open` AFTER hooks are declared (hooks must run unconditionally — declare state +
  effect first, then `if (!open) return null`).
- `handleSelect(id)`: `setSelected(id); setMobileView("detail")`. (Desktop sidebar also calls this; on desktop
  mobileView is irrelevant since the mobile branch is `md:hidden`.)

Derive the active section title and body for the mobile branch INSIDE SettingsModal (do not rely on
SettingsContent, which is now desktop-only). Add a local `renderBody(selected)` helper OR import the section
components and replicate the mapping:
  - import { NAV_ITEMS } from "./navItems"
  - import GeneralSection, PaymentsSection, ShoppingSection, PlaceholderSection (from ../../sections/...)
  - const activeItem = NAV_ITEMS.find(i => i.id === selected); const title = activeItem?.label ?? "Settings";
  - body mapping identical to old SettingsContent.renderBody.
  (To avoid duplicating the mapping in two files, you MAY instead export a small `renderSection(selected)` /
   `getSectionTitle(selected)` from a shared spot, but a local helper here is acceptable and simpler. Keep
   SettingsContent self-contained per Task 1.)

DESKTOP branch (md+) — UNCHANGED behavior, just gate it with `hidden md:flex`:
- Outer: `<div className="hidden md:flex fixed inset-0 bg-black/40 backdrop-blur-sm md:items-center md:justify-center md:p-6 z-50" onClick={onClose}>`
- Inner panel: keep the existing classes (rounded-2xl, md:w-[min(900px,calc(100vw-48px))], md:min-h-[600px],
  md:max-h-[calc(100vh-48px)], shadow-xl, flex md:flex-row overflow-hidden) with `onClick={(e)=>e.stopPropagation()}`.
- Children: `<SettingsNav selected={selected} onSelect={handleSelect} onCloseModal={onClose} />`,
  the `md:w-px bg-gray-100` divider, and `<SettingsContent selected={selected} />`.
  (Note SettingsNav/SettingsContent now take the trimmed props from Tasks 1 & 2.)

MOBILE branch (<md) — NEW full-screen master-detail, gated `md:hidden`:
- Outer: `<div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">` (no scrim, no blur, no padding).
- When `mobileView === "list"`:
  - Header row: `flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0` →
    left `<h1 className="text-lg font-semibold text-gray-900">Settings</h1>`, right a close button
    (lucide `X`, aria-label="Close settings", onClick={onClose}, styled `p-1.5 rounded-lg text-gray-600 hover:bg-gray-100`).
  - Body: scrollable `flex-1 min-h-0 overflow-y-auto`. Render NAV_ITEMS as full-width rows:
    `<button onClick={() => handleSelect(item.id)} className="flex items-center gap-3 w-full px-4 py-3.5 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors">`
    containing: `<Icon size={20} className="text-gray-700 shrink-0" />`, `<span className="text-sm text-gray-900">{item.label}</span>`,
    the Demo tag pill when `item.tag` (reuse `ml-2 text-[10px] font-medium rounded-full px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100`),
    and a right-aligned `<ChevronRight size={18} className="ml-auto text-gray-400 shrink-0" />`.
- When `mobileView === "detail"`:
  - Header row: `flex items-center gap-2 px-2 h-14 border-b border-gray-100 shrink-0` →
    a back button (lucide `ChevronLeft` or `ArrowLeft`, aria-label="Back", onClick={() => setMobileView("list")},
    styled `p-1.5 rounded-lg text-gray-600 hover:bg-gray-100`), then `<h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>`,
    then a close button on the right (`ml-auto`, lucide `X`, aria-label="Close settings", onClick={onClose}).
  - Body: `flex-1 min-h-0 overflow-y-auto p-4 flex flex-col` wrapping `renderBody(selected)`. The
    `flex flex-col` + `flex-1 min-h-0` is REQUIRED so ShoppingSection's `flex-1 min-h-0` fill+scroll works
    (it expects a flex-column parent that gives it height). Do NOT use a plain block here.
- Imports: add `ChevronRight`, `ChevronLeft` (or `ArrowLeft`), keep `X` from lucide-react.

Remove the old single combined root (`bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 md:p-6`)
— it is replaced by the two gated branches above. Render both branches as siblings inside a fragment.

Self-check: App.tsx unchanged; SettingsModal still `{ open, onClose }`; desktop renders identically; mobile
opens to list, row → detail, back → list, X → onClose; reopening resets to list.
  </action>
  <verify>
    <automated>npm run build && npm test</automated>
  </verify>
  <done>
SettingsModal renders a `hidden md:flex` desktop centered modal (unchanged behavior) and a `md:hidden`
full-screen list/detail flow. mobileView drives list↔detail; X closes; back pops to list; open resets to list.
Demo tags show on list rows; detail body scrolls. tsc + vite build clean; all 24 tests green.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Unified mobile settings: full-screen List → Detail master-detail flow (desktop unchanged).</what-built>
  <how-to-verify>
1. `npm run dev`, open at 375px width (mobile / device toolbar).
2. Tap Settings on the home page → a FULL-SCREEN List appears: "Settings" title left, X right; NAV_ITEMS as
   rows with chevrons; Payments and Shopping show the indigo "Demo" pill.
3. Tap "Payments" → full-screen Detail: back arrow + "Payments" title left, X right; body scrolls (scroll the
   transactions/cards content). Tap "Shopping" path too — confirm the chat composer + transcript fill and scroll.
4. Tap the back arrow → returns to the List screen.
5. Tap X (from either list or detail) → closes settings back to the ChatGPT home.
6. Re-open Settings → it resets to the List screen (not the last detail).
7. Confirm there is NO centered card, NO blurred backdrop, and NO hamburger/left drawer on mobile.
8. Resize to desktop (≥768px / md): the centered TWO-PANE modal is UNCHANGED — sidebar nav with X close,
   single h1 title, backdrop-click closes, clicking inside the panel does not close.
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues (mobile flow, desktop regression, scrolling, Demo tags).</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` clean (tsc strict + vite).
- `npm test` → all 24 tests green (no behavior touched in store/persistence).
- Mobile (<md): full-screen list/detail; no centered card/blur/drawer; back + X behave; reopen resets to list; Demo tags on rows; detail body scrolls.
- Desktop (md+): centered two-pane modal identical to before.
- App.tsx untouched; SettingsModal props remain `{ open, onClose }`.
</verification>

<success_criteria>
- One unified mobile settings flow (List → Detail) replaces the popup + drawer.
- Desktop two-pane centered modal is not regressed.
- Old mobile chrome (SettingsNav drawer, SettingsContent hamburger + mobile X) removed.
- Demo tags visible in mobile list rows; tall section bodies scroll on mobile detail.
- Build + tests pass.
</success_criteria>

<output>
After completion, create `.planning/quick/260609-rad-unify-mobile-settings-ux-into-a-full-scr/260609-rad-SUMMARY.md`
</output>
