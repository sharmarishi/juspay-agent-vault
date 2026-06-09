---
phase: quick-260609-kpv
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/components/cards/CardDetailModal.tsx]
autonomous: true
requirements: [QUICK-260609-kpv]
must_haves:
  truths:
    - "Card header (CardVisual, issued-under line, spend-vs-limit bar, Simulate a payment button) is always visible above a horizontal tab bar"
    - "A tab bar lets the user switch between Virtual cards / Controls / Used by apps without scrolling through one long stack"
    - "Physical cards show all three tabs; virtual cards omit the Virtual cards tab (they have no children)"
    - "Default active tab is Controls for both card types"
    - "Switching between cards (drill-down via onSelectCard, or reopen) never strands the user on a hidden/irrelevant tab"
    - "All existing behavior is preserved: SimulatePaymentModal, onSelectCard drill-down, updateCard/removeCard, limit/MFA inputs, freeze/delete"
  artifacts:
    - path: "src/components/cards/CardDetailModal.tsx"
      provides: "Tabbed card detail modal with header + Virtual cards / Controls / Used by apps tabs"
      contains: "useState"
  key_links:
    - from: "src/components/cards/CardDetailModal.tsx"
      to: "active tab state"
      via: "useState + reset on card change"
      pattern: "useState"
    - from: "src/components/cards/CardDetailModal.tsx tab bar"
      to: "JUSPAY_ACCENT styling"
      via: "border-b-2 + inline color (matches PaymentsSection pattern)"
      pattern: "JUSPAY_ACCENT"
---

<objective>
Reorganize CardDetailModal's single long stacked layout into horizontal tabs: **Virtual cards / Controls / Used by apps**, reusing the exact tab-bar visual pattern from PaymentsSection so it looks native.

Purpose: The card detail view is currently one long scroll. Tabs make controls, usage, and child cards each a focused view while keeping the card identity and primary action always in sight.

Output: Refactored `src/components/cards/CardDetailModal.tsx` — purely a reorganization, zero behavior/data changes.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

The component to refactor (read fully before editing):
@src/components/cards/CardDetailModal.tsx

Reuse this exact tab-bar visual pattern (Overview/Cards/Transactions segmented control) so the modal tabs look native — do NOT invent a new visual language:
@src/sections/PaymentsSection.tsx

The "Used by apps" tab content (already a self-contained component, just relocate its render call):
@src/components/payments/AppUsageBreakdown.tsx

<interfaces>
<!-- Already imported/used inside CardDetailModal — no new imports needed except none. -->

JUSPAY_ACCENT = "#4F46E5" from src/theme/tokens.ts (already imported in CardDetailModal).

PaymentsSection tab-bar pattern to mirror (active tab gets inline color + borderColor = JUSPAY_ACCENT, inactive is text-gray-500):
```tsx
<div className="flex items-center gap-1 border-b border-gray-100">
  {tabs.map(({ key, label }) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      className={`text-sm px-3 py-2 -mb-px border-b-2 transition-colors ${
        tab === key ? "border-current font-medium" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
      style={tab === key ? { color: JUSPAY_ACCENT, borderColor: JUSPAY_ACCENT } : undefined}
    >
      {label}
    </button>
  ))}
</div>
```

Existing CardDetailModal derived values (keep all): `liveCard`, `childCards`, `parentLabel`, `appName`, `cardTxns`, `spendPercent`, `statusColor`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add tab state with card-aware reset and tab type</name>
  <files>src/components/cards/CardDetailModal.tsx</files>
  <action>
Add local tab state to drive the reorganization. Do NOT change any other logic yet — this task only introduces the state machine.

1. Define a tab type and constant near the top of the component body:
   - `type DetailTab = "virtual" | "controls" | "usage";`
2. Add state: `const [tab, setTab] = useState<DetailTab>("controls");` — default is **Controls** (most universally relevant; the only tab guaranteed to exist for both card types). Note this default choice.
3. Build the visible-tabs list AFTER `liveCard` is derived (so it can branch on card type). Order: Virtual cards, Controls, Used by apps.
   - Physical cards (`liveCard.type === "physical"`): all three → `[{ key: "virtual", label: "Virtual cards" }, { key: "controls", label: "Controls" }, { key: "usage", label: "Used by apps" }]`.
   - Virtual cards: OMIT the "virtual" tab (they have no children) → `[{ key: "controls", label: "Controls" }, { key: "usage", label: "Used by apps" }]`. Note: hiding (not relabeling) the Virtual cards tab for virtual cards.
4. Reset stranding fix: when switching cards (drill-down via onSelectCard reuses the same modal with a different `card.id`), the active tab could point at a now-hidden tab. Add an effect keyed on `liveCard.id` that resets `setTab("controls")` whenever the card id changes:
   ```tsx
   useEffect(() => { setTab("controls"); }, [liveCard.id]);
   ```
   Import `useEffect` alongside the existing `useState` import from React. "controls" is always present for both card types, so this can never strand the user. Also guard render: if `tab` is not in the current visible-tabs list, fall back to "controls" when deriving which content to show (belt-and-suspenders).

Place the `useState`/`useEffect` with the other hooks at the top of the component. Hooks must run before the `if (!card)` early return is reached on a render where card is null — keep hooks above that guard (they already are: simulateOpen useState sits above it). Add the new useState next to it, and the useEffect must also be above the early return. NOTE: `liveCard` is currently derived AFTER the early return, but the effect depends on `liveCard.id`. To keep hooks unconditional, derive the effect dependency safely: use `card?.id` as the effect dependency instead of `liveCard.id` (card is the prop; resetting on prop card id change is equivalent and avoids referencing a value computed after the guard). Use:
   ```tsx
   useEffect(() => { setTab("controls"); }, [card?.id]);
   ```
  </action>
  <verify>
    <automated>cd /Users/rishi.sharma/Desktop/make/juspay-agent-vault && npx tsc --noEmit</automated>
  </verify>
  <done>Component compiles. `tab` state exists defaulting to "controls", `useEffect` resets tab to "controls" on `card?.id` change, and a card-type-aware visible-tabs list is defined. No JSX reorganized yet (or partially) — full reorg in Task 2.</done>
</task>

<task type="auto">
  <name>Task 2: Render persistent header + tab bar + tab panels</name>
  <files>src/components/cards/CardDetailModal.tsx</files>
  <action>
Reorganize the JSX inside the `<Modal>` into: a persistent header, a tab bar, then tab-specific panels. Move existing blocks — do NOT rewrite their internals (preserve all handlers, keys, inline styles, classNames, and the SimulatePaymentModal wiring exactly).

PERSISTENT HEADER (always visible, above tab bar) — keep in this order:
1. The large `<CardVisual card={liveCard} />` block (current section 1).
2. The parent label line for virtual cards — `{parentLabel && (...)}` (current section 1a).
3. The "Simulate a payment" button block (current section 2a) — keep its `onClick={() => setSimulateOpen(true)}` and JUSPAY_ACCENT styling.
4. The spend-vs-limit indicator block (current section 2).

TAB BAR (immediately after header): render using the PaymentsSection pattern in <interfaces>. Map over the card-type-aware visible-tabs list from Task 1. Active tab uses `style={{ color: JUSPAY_ACCENT, borderColor: JUSPAY_ACCENT }}` and `border-current font-medium`; inactive uses `border-transparent text-gray-500 hover:text-gray-700`. Wrap in `<div className="flex items-center gap-1 border-b border-gray-100 mb-5">`. Compute an `activeTab` value that falls back to "controls" if `tab` is not in the visible list.

TAB PANELS (render only the active one):
- **Virtual cards** (`activeTab === "virtual"`, physical cards only): the entire current "Virtual cards list for physical cards" block (section 1b) — the `<p>Virtual cards</p>` heading, the empty-state message, and the `<ul>` of child rows with `onClick={() => onSelectCard?.(child)}`. Keep all of it verbatim.
- **Controls** (`activeTab === "controls"`): the Settings card block (section 3 — Spending limit input, MFA threshold input, MFA enforcement Toggle, Status row, all with their existing `key={liveCard.id}` and updateCard handlers) AND directly below it the freeze/unfreeze + delete actions row (section 6 — both buttons with their updateCard/removeCard+onClose handlers). Keep the `border-t border-gray-100 pt-1` actions row styling.
- **Used by apps** (`activeTab === "usage"`): `<AppUsageBreakdown cardId={liveCard.id} />` (section 4) AND the Transaction history block (section 5 — the `<p>Transaction history</p>` heading, empty-state, and the `<ul>` mapping cardTxns with merchant/date/subscription pill/amount/status chip). Keep both verbatim.

KEEP OUTSIDE TABS (at the end, unchanged): the `<SimulatePaymentModal>` element with its `cardId`, `onClose`, and `key` props exactly as-is.

Remove the old section comment markers/wrappers as you relocate, but every interactive element, handler, key prop, and style must survive the move unchanged. The goal is reorganization only.
  </action>
  <verify>
    <automated>cd /Users/rishi.sharma/Desktop/make/juspay-agent-vault && npx tsc --noEmit && npm run build</automated>
  </verify>
  <done>
Modal renders a persistent header (CardVisual + issued-under line + Simulate button + spend bar), then a tab bar matching PaymentsSection styling, then one active panel. Physical cards show Virtual cards / Controls / Used by apps; virtual cards show Controls / Used by apps. Default tab is Controls. Switching cards resets to Controls. tsc and build pass. All handlers (Simulate, onSelectCard, limit/MFA/toggle updateCard, freeze/delete, SimulatePaymentModal) function identically.
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes (no type errors).
- `npm run build` succeeds.
- Manual smoke (executor describes, not required to run): open a physical card → three tabs, Controls active; child list under Virtual cards; usage + transactions under Used by apps. Open a virtual card → two tabs (Controls / Used by apps), no Virtual cards tab. Drill into a child from Virtual cards tab → modal resets to Controls. Simulate a payment button works from header on any tab.
</verification>

<success_criteria>
- CardDetailModal content is divided into Virtual cards / Controls / Used by apps tabs with a persistent header above the tab bar.
- Tab bar visually matches PaymentsSection's segmented control (JUSPAY_ACCENT active state).
- Tab visibility is card-type aware (virtual cards omit Virtual cards tab); default tab is Controls; switching cards never strands on a hidden tab.
- Zero behavior/data-model changes — all existing handlers and modal wiring preserved.
- tsc and build pass.
</success_criteria>

<output>
After completion, create `.planning/quick/260609-kpv-in-the-card-detail-view-divide-the-singl/260609-kpv-SUMMARY.md`
</output>
