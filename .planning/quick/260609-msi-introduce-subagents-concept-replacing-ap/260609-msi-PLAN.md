---
phase: quick-260609-msi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/data/types.ts
  - src/data/seed.ts
  - src/store/useVaultStore.ts
  - src/store/persistence.ts
  - src/store/persistence.test.ts
  - src/components/cards/AddCardModal.tsx
  - src/components/cards/CardDetailModal.tsx
  - src/components/cards/SimulatePaymentModal.tsx
  - src/components/payments/AppUsageBreakdown.tsx
  - src/components/payments/TransactionsList.tsx
autonomous: false
requirements: [SUBAGENT-MODEL, SUBAGENT-ACCESS, SUBAGENT-VIEWS]

must_haves:
  truths:
    - "App builds clean (tsc + vite) and all tests pass after the ConnectedApp→Subagent rename"
    - "Existing localStorage demo data (schema v1) loads without error: old appId values resolve to a subagent, cards gain subagentIds: []"
    - "Seeded transactions each show a distinct merchant (e.g. Safeway) AND a subagent category (e.g. Grocery)"
    - "Add Card (template + custom modes) offers a multi-select of Subagents that can access the card; selections persist on the created card"
    - "Card detail shows which Subagents are granted access to the card"
    - "Transaction rows (TransactionsList + CardDetailModal inline list) show merchant name plus the subagent name in a distinct accent color"
    - "The breakdown is titled 'Used by Subagents', groups by subagentId, and the CardDetailModal tab is labeled 'Used by Subagents'"
    - "Simulate Payment modal offers a Subagent picker (not App/Merchant); created transaction has the chosen subagentId + a derived merchant"
  artifacts:
    - path: "src/data/types.ts"
      provides: "Subagent interface; Transaction.subagentId + merchant; Card.subagentIds; VaultState.subagents"
      contains: "interface Subagent"
    - path: "src/data/seed.ts"
      provides: "SUBAGENTS list + re-seeded transactions with merchant+subagentId + cards with subagentIds"
      contains: "subagentId"
    - path: "src/store/persistence.ts"
      provides: "SCHEMA_VERSION 2 migration mapping old appId→subagentId, adding subagents + card.subagentIds"
      contains: "SCHEMA_VERSION = 2"
    - path: "src/components/cards/AddCardModal.tsx"
      provides: "Subagent-access multi-select for created virtual cards"
      contains: "subagentIds"
    - path: "src/components/payments/AppUsageBreakdown.tsx"
      provides: "Used by Subagents breakdown grouped by subagentId"
      contains: "Used by Subagents"
  key_links:
    - from: "src/store/persistence.ts migrate()"
      to: "old v1 localStorage appId values"
      via: "APP_TO_SUBAGENT map applied to every transaction"
      pattern: "subagentId"
    - from: "src/components/cards/AddCardModal.tsx"
      to: "card.subagentIds"
      via: "addCard payload carries selected subagentIds"
      pattern: "subagentIds"
    - from: "src/components/cards/SimulatePaymentModal.tsx"
      to: "addTransaction"
      via: "chosen subagentId + derived merchant"
      pattern: "subagentId"
---

<objective>
Replace the "apps" / `ConnectedApp` concept with "Subagents" (use-case CATEGORIES) across the data model, store, persistence, and all UI surfaces.

Purpose: Subagents are categories (Grocery, Travel, SaaS…), distinct from a transaction's merchant (Safeway, Booking.com…). Each transaction carries BOTH a merchant and a subagent. Cards record which subagents may access them (store + display only, no enforcement).

Output: Renamed domain model, re-seeded data, a SCHEMA_VERSION 2 migration that preserves existing localStorage, an Add-Card subagent multi-select, card-detail display of granted subagents, transaction rows showing merchant + colored subagent, a "Used by Subagents" breakdown, and a Subagent picker in Simulate Payment.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md

This is a deliberate model RENAME, not just UI relabel:
- `ConnectedApp` → `Subagent` (fields: id, name, icon)
- `VaultState.apps` → `VaultState.subagents`
- `Transaction.appId` → `Transaction.subagentId` (keep `merchant` on Transaction)
- Add `Card.subagentIds: string[]`

<interfaces>
Current types (src/data/types.ts) — these change in Task 1:
```typescript
export interface Transaction {
  id: string;
  cardId: string;
  appId: string;        // -> subagentId
  merchant: string;     // KEEP
  amount: number;
  date: string;
  status: "completed" | "pending" | "declined";
  isSubscription: boolean;
}
export interface ConnectedApp { id: string; name: string; icon: string; } // -> Subagent
export interface VaultState {
  cards: Card[];
  transactions: Transaction[];
  apps: ConnectedApp[];  // -> subagents: Subagent[]
  schemaVersion?: number;
}
export interface Card { /* … */ } // add subagentIds: string[]
```

Store snapshot helper (src/store/useVaultStore.ts) destructures `{ cards, transactions, apps }` — must become `{ cards, transactions, subagents }`.

ALL consumers of `s.apps` / `t.appId` (confirmed via grep — full list):
- TransactionsList.tsx, AppUsageBreakdown.tsx, SimulatePaymentModal.tsx, CardDetailModal.tsx
- DashboardOverview.tsx only uses `t.merchant` (no appId) → no change needed.

Persistence pattern: SCHEMA_VERSION const + idempotent migrate(state) run on every loadState(). Existing v1 logic attaches orphan virtual cards to first physical card — KEEP it working.

DO NOT TOUCH: navItems.ts "Apps" nav item (ChatGPT's Apps section), and GeneralSection.tsx "authenticator app" text. Both unrelated.

Color token: JUSPAY_ACCENT = "#4F46E5" (src/theme/tokens.ts), used inline (Tailwind JIT can't do dynamic hex).
</interfaces>

@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Domain model + seed + store + persistence migration (SCHEMA_VERSION 2)</name>
  <files>src/data/types.ts, src/data/seed.ts, src/store/useVaultStore.ts, src/store/persistence.ts, src/store/persistence.test.ts</files>
  <action>
Rename ConnectedApp→Subagent and rewire data layer. Subagents are use-case CATEGORIES.

**1. types.ts**
- Rename `ConnectedApp` → `Subagent` (keep fields id, name, icon).
- In `Transaction`: rename `appId` → `subagentId` (FK → Subagent.id). KEEP `merchant: string`.
- In `Card`: add `subagentIds: string[]` (which subagents may access this card; store/display only, no enforcement).
- In `VaultState`: rename `apps: ConnectedApp[]` → `subagents: Subagent[]`.

**2. seed.ts**
- Replace `APPS` with a fixed `SUBAGENTS: Subagent[]` of 6 CATEGORY subagents with sensible lucide icons:
  - `sub_shopping` "Shopping" icon "ShoppingBag"
  - `sub_grocery` "Grocery" icon "ShoppingCart"
  - `sub_gaming` "Gaming" icon "Gamepad2"
  - `sub_saas` "SaaS" icon "Code2"
  - `sub_travel` "Travel" icon "Plane"
  - `sub_entertainment` "Entertainment" icon "Tv2"
- Re-seed ~14 transactions (keep roughly the same count). Each transaction MUST have a distinct `merchant` (specific vendor) AND a `subagentId` (category). Use these merchant pools per subagent:
  - Grocery → Instacart, Safeway, Whole Foods
  - Travel → Booking.com, Expedia
  - Entertainment → Spotify, Netflix, Ticketmaster
  - SaaS → Notion, Figma
  - Gaming → Steam, PlayStation
  - Shopping → Amazon, Best Buy
  Keep at least 2 `isSubscription: true` (e.g. Spotify/Entertainment, Notion/SaaS), keep a pending and a declined, spread dates with the existing `daysAgo` helper. Keep cardId references valid (cards unchanged ids).
- On EVERY seeded `Card`, add `subagentIds: []` (cards start with no granted subagents in seed; user grants them in Add Card).
- Update `SEED` to `{ cards, transactions, subagents: SUBAGENTS, schemaVersion: 2 }`.

**3. useVaultStore.ts**
- Update the `snapshot` helper's Pick + destructure from `"apps"` to `"subagents"` and return `{ cards, transactions, subagents }`.

**4. persistence.ts**
- Bump `SCHEMA_VERSION` to `2`.
- Add an `APP_TO_SUBAGENT` map covering every old seed appId so old persisted transactions resolve:
  `app_instacart→sub_grocery, app_booking→sub_travel, app_expedia→sub_travel, app_spotify→sub_entertainment, app_notion→sub_saas, app_chatgpt→sub_shopping`.
- Extend `migrate(state)` (KEEP existing orphan-virtual-card→first-physical logic, keep idempotency):
  - For each transaction: if it has legacy `appId` and no `subagentId`, set `subagentId = APP_TO_SUBAGENT[appId] ?? "sub_shopping"`, delete the `appId` key, preserve `merchant` (if missing merchant, derive from any old app name or leave as-is). Idempotent: txns that already have `subagentId` untouched.
  - For each card: if `subagentIds` is missing, set `subagentIds: []`.
  - If `state.subagents` is missing/empty (old `apps` data), set `state.subagents = structuredClone(SEED.subagents)`; drop the legacy `apps` key. Migrate from `state.apps` only as a name source if useful; otherwise the fixed SUBAGENTS list is canonical.
  - Set `schemaVersion = SCHEMA_VERSION`.
- Import `Subagent`/`Transaction`/`Card` types as needed; do migration on a typed-loose object (the legacy shape has `appId`/`apps` not in the new types — cast through `any`/`unknown` or a local legacy interface to avoid tsc errors).

**5. persistence.test.ts**
- Keep all existing tests GREEN. Update references that assert on `apps`:
  - The empty-localStorage test: change `state.apps` assertions → `state.subagents`; `subagents.length` >= 5 (we have 6).
  - The orphan/parented/no-physical migration test fixtures use `apps: []` and `transactions: []` — change `apps: []` → `subagents: []` (or keep a legacy fixture; whichever keeps tsc + the test intent). These fixtures have empty transactions so subagentId migration is a no-op for them.
- ADD new tests:
  - "migration: legacy appId transaction gets mapped subagentId and appId removed" — seed localStorage with a v1-shaped txn `{ appId: 'app_instacart', merchant: 'Instacart — Safeway', … }`, assert loaded txn has `subagentId === 'sub_grocery'` and no `appId`.
  - "migration: card without subagentIds gets subagentIds: []" — v1 card fixture lacking subagentIds → loaded card has `subagentIds` deep-equal `[]`.
  - "migration: SEED cards all have subagentIds array" and "SEED transactions all have subagentId + merchant".
  - Update the empty-state seed count assertion comment if needed.

Reference existing decisions: structuredClone for SEED deep clones; vi.stubGlobal localStorage mock; migrate() runs on every loadState().
  </action>
  <verify>
    <automated>npm test</automated>
    <automated>npm run build</automated>
  </verify>
  <done>tsc + vite build clean; all persistence tests green (existing updated + new migration tests pass). SEED has subagents (6 categories), transactions with merchant+subagentId, cards with subagentIds: []. A v1-shaped localStorage payload loads with appId mapped to subagentId and cards gaining subagentIds: [].</done>
</task>

<task type="auto">
  <name>Task 2: Add Card subagent-access multi-select + card-detail granted-subagents display</name>
  <files>src/components/cards/AddCardModal.tsx, src/components/cards/CardDetailModal.tsx</files>
  <action>
**AddCardModal.tsx** — add a "Which Subagents can access this card" multi-select for the two virtual-card creation modes (template + custom). Physical mode does NOT need it (or include with empty default — keep simple; apply to template + custom only).
- Read subagents: `const subagents = useVaultStore((s) => s.subagents);`
- Add state `const [selectedSubagentIds, setSelectedSubagentIds] = useState<string[]>([]);` and reset it in `resetForm()`.
- Render a multi-select as a wrap of toggle "chips" (reuse the pill pattern already in this file): one button per subagent showing its IconRenderer + name; selected chips use `pillActive` (JUSPAY_ACCENT bg/white), unselected `pillInactive`. Clicking toggles membership in `selectedSubagentIds`. Place this block in BOTH the template and custom mode sections, above the "Issued under (card)" selector. Label: "Which Subagents can access this card".
- In `handleTemplateSubmit` and `handleCustomSubmit`, add `subagentIds: selectedSubagentIds` to the `addCard({...})` payload.
- In `handlePhysicalSubmit`, add `subagentIds: []` to keep the Card shape valid.

**CardDetailModal.tsx** — display the granted subagents for the live card.
- Read subagents from store: `const subagents = useVaultStore((s) => s.subagents);` (rename existing `apps` selector to `subagents` — see Task 3 for the usage-tab parts; here just add the granted-access display).
- Add a small "Subagent access" block in the persistent header area (e.g. just under the parent-label / above the tab bar, or inside the Controls tab — choose the header placement for visibility). For each id in `liveCard.subagentIds`, resolve the subagent and render a chip with IconRenderer + name (subtle gray chip). If `subagentIds` is empty, render muted text "No subagents granted access yet."
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Build clean. Template + Custom Add-Card forms show a toggleable Subagent multi-select; created cards carry the chosen subagentIds. Card detail renders granted subagents (or an empty-state line) for the current card.</done>
</task>

<task type="auto">
  <name>Task 3: Transactions (merchant + colored subagent), Used by Subagents breakdown, Simulate subagent picker</name>
  <files>src/components/payments/TransactionsList.tsx, src/components/payments/AppUsageBreakdown.tsx, src/components/cards/CardDetailModal.tsx, src/components/cards/SimulatePaymentModal.tsx</files>
  <action>
COLOR CHOICE for the subagent accent: use JUSPAY_ACCENT (#4F46E5) as a subtle colored pill/text so the subagent category stands out from the gray merchant/date metadata. Apply consistently in both transaction lists.

**TransactionsList.tsx**
- Replace `apps` selector with `const subagents = useVaultStore((s) => s.subagents);`
- Replace `appName(appId)` helper with `subagentName(subagentId) => subagents.find(s => s.id === subagentId)?.name ?? ""`.
- In each row: keep merchant as the primary `text-gray-900` line. Add a colored subagent pill next to/under it — a small rounded pill using inline `style={{ color: JUSPAY_ACCENT, backgroundColor: JUSPAY_ACCENT + '14' }}` (faint accent tint) text-[10px]. Remove the subagent from the gray meta line (keep `cardLabel · date` there). So the meta line becomes `[cardLabel, t.date].filter(Boolean).join(" · ")` and the subagent shows as its own accent pill.

**CardDetailModal.tsx** (inline txn list + tab label)
- Rename the `apps` selector to `subagents`; replace `appName` helper with `subagentName` resolving subagentId.
- Tab label: change `{ key: "usage", label: "Used by apps" }` → `label: "Used by Subagents"` (both physical and virtual tab arrays).
- Inline transaction history rows: same treatment as TransactionsList — merchant primary, an accent-colored subagent pill (JUSPAY_ACCENT tint), and the gray meta line shows just `t.date` (drop the old `appName · date`).

**AppUsageBreakdown.tsx**
- Replace `apps` selector with `subagents`; group by `t.subagentId` instead of `t.appId`. Rename local vars accordingly (subagentId/subagent).
- Resolve `subagents.find(a => a.id === subagentId)` for name/icon.
- Header text: "Used by apps" → "Used by Subagents". Empty state: "No app usage yet." → "No subagent usage yet."

**SimulatePaymentModal.tsx** (replace App/Merchant picker with Subagent picker)
- Replace `apps` selector with `const subagents = useVaultStore((s) => s.subagents);`
- Rename state `appId`→`subagentId`, default `subagents[0]?.id ?? ""`.
- Label "App / Merchant" → "Subagent". Options map over `subagents` (id/name).
- MERCHANT DERIVATION (simpler clean approach — note this): derive a default merchant from the chosen subagent's name, e.g. `merchant: \`${subagent.name} purchase\`` (e.g. "Grocery purchase"). In `postPayment`, set `subagentId` and this derived `merchant` on the new transaction. (Chosen over a per-subagent merchant dropdown to keep the simulate flow one-tap.)
- Keep the existing step/challenge/MFA/over-limit/frozen evaluation flow unchanged.
  </action>
  <verify>
    <automated>npm run build</automated>
    <automated>npm test</automated>
  </verify>
  <done>Build + tests clean. Transaction rows (both lists) show merchant plus a JUSPAY_ACCENT-tinted subagent pill. Breakdown is titled "Used by Subagents" and groups by subagentId; empty state reads "No subagent usage yet." CardDetailModal usage tab is labeled "Used by Subagents". Simulate modal has a Subagent picker; simulated payments produce a txn with the chosen subagentId + a derived "<Subagent> purchase" merchant.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Full Subagents rename: data model, re-seeded data, SCHEMA_VERSION 2 migration, Add-Card subagent multi-select, card-detail granted-subagents display, merchant+colored-subagent transaction rows, "Used by Subagents" breakdown, and Simulate subagent picker.</what-built>
  <how-to-verify>
Run `npm run dev` and in the Payments section:
1. **Add Card → Token Templates (or Create Token):** confirm the "Which Subagents can access this card" chips appear and toggle; create a card with 2 subagents selected.
2. **Open that card's detail:** confirm the granted subagents are displayed; empty cards show "No subagents granted access yet."
3. **Transactions list (overview/transactions tab) AND a card's inline history:** confirm each row shows a specific merchant (e.g. Safeway) plus a distinct accent-colored subagent pill (e.g. Grocery) — verify desktop AND 375px mobile width.
4. **Card detail → "Used by Subagents" tab:** confirm the label and the breakdown grouped by subagent category.
5. **Simulate a payment:** confirm the picker says "Subagent" (categories, not merchants); run a payment and confirm a new transaction appears with the chosen category + a "<Subagent> purchase" merchant, and the MFA/over-limit flow still works.
6. (Optional) With pre-existing localStorage from before this change, confirm the app still loads and old transactions show a subagent.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues.</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` (tsc + vite) clean — no `appId`/`ConnectedApp`/`s.apps` references remain in src (except the unrelated navItems "Apps" nav and GeneralSection "authenticator app" text, which must be untouched).
- `npm test` — all persistence tests green, including new migration tests for appId→subagentId mapping and card.subagentIds default.
- Desktop + 375px mobile transaction rows render merchant + colored subagent without layout breakage.
</verification>

<success_criteria>
- ConnectedApp→Subagent / apps→subagents / appId→subagentId rename complete across model, store, persistence, and all UI.
- Card.subagentIds added, surfaced as an Add-Card multi-select, displayed in card detail (no enforcement).
- Seeded transactions show distinct merchant + category subagent; ~same count; 2+ subscriptions preserved.
- SCHEMA_VERSION 2 migration preserves existing localStorage (maps every old seed appId, defaults cards to subagentIds: [], keeps v1 orphan-virtual-card logic).
- Transaction rows show merchant + JUSPAY_ACCENT-tinted subagent pill; breakdown + tab relabeled "Used by Subagents"; Simulate uses a Subagent picker with derived "<Subagent> purchase" merchant.
</success_criteria>

<output>
After completion, create `.planning/quick/260609-msi-introduce-subagents-concept-replacing-ap/260609-msi-SUMMARY.md`
</output>
