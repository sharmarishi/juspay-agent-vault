---
phase: quick-260609-kbu
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/data/types.ts
  - src/store/persistence.ts
  - src/data/seed.ts
  - src/components/cards/AddCardModal.tsx
  - src/sections/PaymentsSection.tsx
  - src/components/cards/CardDetailModal.tsx
autonomous: false
requirements: [VCARD-FIX-01, VCARD-FIX-02]
must_haves:
  truths:
    - "When creating a virtual card (template or custom mode), the user must pick a parent physical card before submitting"
    - "A created virtual card stores the chosen parent physical card id"
    - "The Cards tab shows only physical cards"
    - "Clicking a physical card reveals the virtual cards created under it"
    - "Existing seeded/persisted virtual cards still display under a physical parent (no broken/orphan cards)"
  artifacts:
    - path: "src/data/types.ts"
      provides: "parentCardId field on Card; schemaVersion on VaultState"
      contains: "parentCardId"
    - path: "src/store/persistence.ts"
      provides: "schema migration attaching orphan virtual cards to first physical card"
      contains: "SCHEMA_VERSION"
    - path: "src/components/cards/AddCardModal.tsx"
      provides: "physical-card selector for virtual card creation modes"
      contains: "parentCardId"
    - path: "src/sections/PaymentsSection.tsx"
      provides: "Cards tab grid filtered to physical cards only"
      contains: "type === \"physical\""
    - path: "src/components/cards/CardDetailModal.tsx"
      provides: "child virtual cards list inside physical card detail"
  key_links:
    - from: "src/components/cards/AddCardModal.tsx"
      to: "Card.parentCardId"
      via: "addCard payload includes parentCardId from selector"
      pattern: "parentCardId"
    - from: "src/sections/PaymentsSection.tsx"
      to: "Card.type filter"
      via: "grid maps only physical cards"
      pattern: "filter.*physical"
    - from: "src/components/cards/CardDetailModal.tsx"
      to: "Card.parentCardId"
      via: "children = cards.filter(c => c.parentCardId === liveCard.id)"
      pattern: "parentCardId === "
---

<objective>
Fix the virtual card feature so virtual cards belong to a parent physical card, and the Cards section presents physical cards with drill-down to their virtual children.

Purpose: The current model lets virtual cards exist standalone and lists every card flat. Real virtual cards are issued on top of a funding (physical) card. This makes the demo accurate and the Cards UI hierarchical.

Output:
- `Card` gains `parentCardId?: string`; `VaultState` gains `schemaVersion`.
- A migration that attaches any orphan virtual card to the first physical card so existing localStorage users don't break.
- AddCardModal template + custom modes include a physical-card selector; created virtual cards store the parent.
- Cards tab shows only physical cards; opening a physical card's detail reveals its virtual children (drill-down).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

<interfaces>
Current Card type (src/data/types.ts) — extend with parentCardId:
```typescript
export type CardType = "physical" | "virtual";
export interface Card {
  id: string;
  type: CardType;
  useCase: UseCase;
  label: string;
  maskedNumber: string;
  status: CardStatus;
  limit: number;
  spent: number;
  mfaThreshold: number;
  mfaEnabled: boolean;
  color: string;
  icon: string;
  holder?: string;   // physical only
  expiry?: string;   // physical only
  // NEW: parentCardId?: string;  // virtual only — FK to a physical Card.id
}
export interface VaultState {
  cards: Card[];
  transactions: Transaction[];
  apps: ConnectedApp[];
  // NEW: schemaVersion?: number;
}
```

Persistence (src/store/persistence.ts) — loadState currently returns parsed state with NO migration:
```typescript
const parsed = JSON.parse(raw) as VaultState;
return parsed;   // <-- migration hook goes here
```

Store actions (src/store/useVaultStore.ts) — `addCard(card: Card)` appends; `removeCard(id)` already filters transactions by cardId. `snapshot()` persists {cards, transactions, apps}.

Seed (src/data/seed.ts) — physical card id is `card_physical_01`; the 5 virtual cards (`card_groceries_01`, `card_saas_01`, `card_travel_01`, `card_shopping_01`, `card_custom_01`) currently have NO parent.

AddCardModal (src/components/cards/AddCardModal.tsx) — Mode = "physical" | "template" | "custom". `handleTemplateSubmit` and `handleCustomSubmit` build virtual-card payloads via `addCard({...})`. `generateCardId`/`generateMaskedNumber` from cardTemplates.

PaymentsSection (src/sections/PaymentsSection.tsx) — Cards tab maps `cards.map(card => ...)` into a grid with CardVisual + freeze/delete row, and opens CardDetailModal via `setDetailCard(card)`.

CardDetailModal (src/components/cards/CardDetailModal.tsx) — derives `liveCard` from store; reads `cards`, `transactions`, `apps`. Renders CardVisual, simulate button, spend bar, settings, AppUsageBreakdown, transaction history, freeze/delete.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add parentCardId to data model + schema migration + seed parents</name>
  <files>src/data/types.ts, src/store/persistence.ts, src/data/seed.ts, src/store/persistence.test.ts</files>
  <behavior>
    - loadState() on a state whose virtual cards lack parentCardId attaches each orphan virtual card's parentCardId to the first physical card's id, and stamps schemaVersion.
    - loadState() leaves already-parented virtual cards untouched.
    - If no physical card exists, orphan virtual cards are left as-is (parentCardId undefined) without throwing.
    - SEED loads with every virtual card carrying parentCardId = "card_physical_01".
  </behavior>
  <action>
    1. src/data/types.ts: Add optional `parentCardId?: string;` to `Card` (document: "virtual only — FK to a physical Card.id"). Add optional `schemaVersion?: number;` to `VaultState`.

    2. src/data/seed.ts: Add `parentCardId: "card_physical_01"` to all 5 virtual card objects (groceries, saas, travel, shopping, custom). Add `schemaVersion: 1` to the exported `SEED` object.

    3. src/store/persistence.ts:
       - Export `const SCHEMA_VERSION = 1;`.
       - Add a `migrate(state: VaultState): VaultState` function: find the first card with `type === "physical"`; for each virtual card lacking `parentCardId`, set it to that physical card's id (skip if no physical card exists). Set `state.schemaVersion = SCHEMA_VERSION`. Return the migrated state. Do not mutate in a way that corrupts — build a new cards array.
       - In `loadState`, after `JSON.parse`, run `return migrate(parsed);` instead of returning `parsed` directly. The SEED clone branches can also pass through migrate (idempotent) for consistency.

    4. src/store/persistence.test.ts: Add tests covering the behavior block — (a) a saved state with a virtual card missing parentCardId gets attached to the physical card id after reload; (b) an already-parented virtual card keeps its parentCardId; (c) loaded SEED virtual cards have parentCardId set. Follow the existing dynamic-import + localStorageMock pattern in this file.

    Note: parentCardId default-attachment to the first physical card is the chosen migration policy so existing localStorage users (and seed) never show orphan virtual cards.
  </action>
  <verify>
    <automated>cd /Users/rishi.sharma/Desktop/make/juspay-agent-vault && npm test</automated>
  </verify>
  <done>Card has parentCardId, VaultState has schemaVersion, SEED virtual cards reference card_physical_01, migration attaches orphans to the first physical card, and persistence tests pass.</done>
</task>

<task type="auto">
  <name>Task 2: Physical-card selector in AddCardModal for virtual creation</name>
  <files>src/components/cards/AddCardModal.tsx</files>
  <action>
    Add a parent physical-card selector to the TEMPLATE and CUSTOM modes (not physical mode).

    1. Read physical cards from the store: `const cards = useVaultStore((s) => s.cards);` then `const physicalCards = cards.filter((c) => c.type === "physical");`.
    2. Add state: `const [parentCardId, setParentCardId] = useState<string>("");`. In `resetForm`, reset it to `""`. When the modal opens with physical cards present, default the selector to the first physical card id (e.g. initialize/derive a sensible default — if parentCardId is empty and physicalCards.length, use physicalCards[0].id at submit time).
    3. Render a `<select>` (reuse `inputCls`) labeled "Issued under (physical card)" inside BOTH the template-mode block and the custom-mode block, above the submit button. Options: each physical card as `{label} — {maskedNumber}`. If `physicalCards.length === 0`, render a disabled note "Add a physical card first" and disable the submit button for these modes.
    4. In `handleTemplateSubmit` and `handleCustomSubmit`, include `parentCardId: parentCardId || physicalCards[0]?.id` in the `addCard({...})` payload (per the parent-relationship requirement). Gate `templateValid`/`customValid` to also require a resolvable parent (physicalCards.length > 0).
    5. Leave PHYSICAL mode unchanged (physical cards have no parent).
  </action>
  <verify>
    <automated>cd /Users/rishi.sharma/Desktop/make/juspay-agent-vault && npm run build</automated>
  </verify>
  <done>Template and custom modes show a physical-card selector, block submission when no physical card exists, and the created virtual card's payload includes parentCardId set to the selected (or first) physical card.</done>
</task>

<task type="auto">
  <name>Task 3: Physical-only Cards grid + virtual-children drill-down in detail</name>
  <files>src/sections/PaymentsSection.tsx, src/components/cards/CardDetailModal.tsx</files>
  <action>
    Decision: drill-down lives inside CardDetailModal (matches existing modal-based detail structure; no new inline-expand component needed). Clicking a virtual child swaps the open detail to that child.

    PaymentsSection.tsx (Cards tab):
    1. Derive `const physicalCards = cards.filter((c) => c.type === "physical");` and map the grid over `physicalCards` instead of `cards`. Keep the empty-state check based on physicalCards.length.
    2. Keep CardVisual + freeze/delete action row as-is, but operate on physical cards. (Virtual freeze/delete remains reachable from inside the detail modal.)
    3. Leave the Reset demo button and modal mounts unchanged.

    CardDetailModal.tsx:
    1. Compute children for physical cards: `const childCards = liveCard.type === "physical" ? cards.filter((c) => c.type === "virtual" && c.parentCardId === liveCard.id) : [];`.
    2. Add a section (place it after the CardVisual / before or after the spend bar, fitting the existing layout) titled "Virtual cards" that renders only when `liveCard.type === "physical"`. List each child as a clickable row showing icon (IconRenderer name={child.icon}), label, maskedNumber, and status. Empty state: "No virtual cards yet — create one with + Add card." 
    3. Clicking a child row must open that child's detail. Since this modal is controlled by PaymentsSection's `detailCard` state, the cleanest path: the modal currently receives `card` and `onClose` only. Add an optional `onSelectCard?: (card: Card) => void` prop; render child rows to call `onSelectCard?.(child)`. In PaymentsSection, pass `onSelectCard={(c) => setDetailCard(c)}` so clicking a child swaps the open modal to the child card. (Avoid creating a separate state path — reuse setDetailCard.)
    4. For virtual cards opened directly, optionally show a small "Issued under {parentLabel}" line using `cards.find(c => c.id === liveCard.parentCardId)?.label` when parentCardId exists. Keep it subtle.
  </action>
  <verify>
    <automated>cd /Users/rishi.sharma/Desktop/make/juspay-agent-vault && npm run build</automated>
  </verify>
  <done>Cards tab grid renders only physical cards; opening a physical card shows its virtual children; clicking a child opens that child's detail; build passes.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>parentCardId data model + migration, AddCardModal physical-card selector for virtual cards, physical-only Cards grid with virtual-children drill-down in CardDetailModal.</what-built>
  <how-to-verify>
    1. Run `npm run dev` and open the app, go to Settings → Payments → Cards tab.
    2. Confirm the grid now shows ONLY the physical card(s) (the standalone virtual cards should no longer appear in the top-level grid).
    3. Click the physical card → in the detail modal, confirm a "Virtual cards" section lists the 5 seeded virtual cards (Groceries, SaaS, Travel, Shopping, Entertainment).
    4. Click one virtual child → its own detail (spend bar, settings, simulate) opens.
    5. Close, click "+ Add card" → "From template", pick a template → confirm an "Issued under (physical card)" selector appears and must be chosen; create it → reopen the physical card and confirm the new virtual card appears under it.
    6. Repeat with "Custom virtual" mode.
    7. (Migration sanity) If you had prior localStorage data, confirm old virtual cards now appear under the physical card rather than disappearing.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `npm test` passes (migration + persistence tests).
- `npm run build` passes (type-check + Vite build) with parentCardId integrated.
- Cards tab grid shows only physical cards.
- CardDetailModal for a physical card lists its virtual children; clicking a child drills into it.
- AddCardModal template/custom modes require and store a parent physical card.
</verification>

<success_criteria>
- A virtual card can only be created against a selected physical card; the chosen parent is persisted on the card.
- The Cards section shows physical cards only, with click-through to the virtual cards created under each.
- Existing seeded and persisted virtual cards are attached to a physical parent via migration (no orphan/broken cards).
</success_criteria>

<output>
After completion, create `.planning/quick/260609-kbu-fixes-in-virtual-card-feature-1-a-virtua/260609-kbu-SUMMARY.md`
</output>
