---
phase: quick-260609-npa
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/sections/ShoppingSection.tsx
  - src/components/settings/navItems.ts
  - src/components/settings/SettingsContent.tsx
autonomous: false
requirements: [SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06]

must_haves:
  truths:
    - "A 'Shopping' nav item appears in settings, placed right after Payments"
    - "User can type/pick a product request and see at least two product variant options"
    - "User can pick one of their existing payment cards (or sees an empty-state when none exist)"
    - "The 'Proceed to Pay' button only appears once BOTH the Spend-limit and MFA toggles are ON"
    - "Clicking Proceed shows an OTP challenge; '123456' confirms, any other code shows an error"
    - "On confirmation, a transaction is recorded in the store and the card's spent increases by the variant price"
    - "A 'Start over' / 'Shop again' button resets the flow to step 1"
  artifacts:
    - path: "src/sections/ShoppingSection.tsx"
      provides: "Full multi-step shopping demo state machine"
      min_lines: 200
    - path: "src/components/settings/navItems.ts"
      provides: "Shopping NAV_ITEM after Payments"
      contains: "id: \"shopping\""
    - path: "src/components/settings/SettingsContent.tsx"
      provides: "Route from selected=shopping to ShoppingSection"
      contains: "ShoppingSection"
  key_links:
    - from: "src/components/settings/SettingsContent.tsx"
      to: "src/sections/ShoppingSection.tsx"
      via: "selected === 'shopping' render branch"
      pattern: "selected === \"shopping\""
    - from: "src/sections/ShoppingSection.tsx"
      to: "useVaultStore"
      via: "addTransaction + updateCard on confirm"
      pattern: "addTransaction|updateCard"
---

<objective>
Add a guided "Shopping" commerce demo as a new settings section. It walks the user
through a narrative agentic-shopping purchase (request -> options -> select card ->
controls -> MFA challenge -> confirmation) that culminates in the existing MFA security
flow, showcasing the product's core value.

Purpose: Give the demo a single, linear "happy path" story that ends in the MFA challenge —
the product's core value — without requiring the user to understand the cards/limits UI first.
Output: A self-contained `ShoppingSection` component plus thin nav/routing wiring. On
confirmation it records a real transaction in the store for realism.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

<interfaces>
<!-- Use these directly — no codebase exploration needed. -->

From src/data/types.ts:
```typescript
export interface Card {
  id: string;
  type: "physical" | "virtual";
  useCase: "groceries" | "saas" | "travel" | "shopping" | "general" | "custom";
  label: string;
  maskedNumber: string;       // e.g. "•••• 4821"
  status: "active" | "frozen";
  limit: number;
  spent: number;
  mfaThreshold: number;
  mfaEnabled: boolean;
  color: string;              // hex, use inline style (Tailwind JIT can't do dynamic hex)
  icon: string;               // lucide icon name string
  subagentIds: string[];
}
export interface Transaction {
  id: string;
  cardId: string;
  subagentId: string;
  merchant: string;
  amount: number;
  date: string;               // ISO string
  status: "completed" | "pending" | "declined";
  isSubscription: boolean;
}
export interface Subagent { id: string; name: string; icon: string; }
```

From src/store/useVaultStore.ts (selector-per-field pattern — avoids re-renders):
```typescript
const cards = useVaultStore((s) => s.cards);
const subagents = useVaultStore((s) => s.subagents);
const addTransaction = useVaultStore((s) => s.addTransaction); // (txn: Transaction) => void
const updateCard = useVaultStore((s) => s.updateCard);         // (id, partial: Partial<Card>) => void
```

From src/components/primitives/Toggle.tsx:
```typescript
export function Toggle(props: { checked: boolean; onChange: (v: boolean) => void });
// Active state already uses JUSPAY_ACCENT.
```

From src/theme/tokens.ts:
```typescript
export const JUSPAY_ACCENT; // "#4F46E5" — use for primary buttons + active accents (inline style)
```

From src/components/cards/IconRenderer.tsx:
```typescript
export function IconRenderer(props: { name: string; size?: number; className?: string });
// Renders a lucide icon by string name; falls back to CreditCard.
```

MFA pattern to mirror — src/components/cards/SimulatePaymentModal.tsx:
- `const DEMO_OTP = "123456";`
- OTP input: type="text", inputMode="numeric", maxLength={6}, tracking-widest text-center, placeholder "------"
- Wrong code -> setError("Incorrect code. Try again."); correct -> proceed.
- Indigo callout block (bg-indigo-50 border-indigo-100) for the "Verify this payment" header.
- Demo hint line: "Demo hint — Enter the code: 123456"
- postPayment recipe: addTransaction({ id: `txn_${Date.now()}_${Math.floor(Math.random()*1000)}`, ... });
  then updateCard(card.id, { spent: card.spent + amt });
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build the ShoppingSection multi-step state machine</name>
  <files>src/sections/ShoppingSection.tsx</files>
  <action>
Create a single self-contained component `ShoppingSection` (default-styled like other
sections — a `<div className="flex flex-col gap-4">` root; the section title "Shopping"
is rendered by the settings shell h1, so DON'T add a duplicate h1). It is a local-useState
step machine (NO routing). Match the existing clean ChatGPT look: rounded-xl borders,
border-gray-200, text-gray-700/900, indigo focus rings; primary buttons use inline
`style={{ backgroundColor: JUSPAY_ACCENT }}` with rounded-full + hover:opacity-90.

State:
```typescript
type Step = "request" | "options" | "card" | "controls" | "mfa" | "confirmed";
const [step, setStep] = useState<Step>("request");
const [query, setQuery] = useState("");
const [variant, setVariant] = useState<ProductVariant | null>(null);
const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
const [limitOn, setLimitOn] = useState(false);
const [mfaOn, setMfaOn] = useState(false);
const [otp, setOtp] = useState("");
const [error, setError] = useState("");
const DEMO_OTP = "123456";
```

Store selectors (selector-per-field): `cards`, `subagents`, `addTransaction`, `updateCard`.

In-file demo catalog (keyword -> variants). Each variant: { id, name, color (hex swatch), price }.
Provide AT LEAST these keywords with 2-3 variants each: cup/mug, shoes, headphones, t-shirt/shirt.
Example shape:
```typescript
interface ProductVariant { id: string; name: string; color: string; price: number; }
const CATALOG: Record<string, ProductVariant[]> = {
  cup: [
    { id: "cup-blue",  name: "Blue Ceramic Mug",  color: "#3B82F6", price: 14.0 },
    { id: "cup-white", name: "White Ceramic Mug", color: "#E5E7EB", price: 12.0 },
    { id: "cup-black", name: "Black Travel Cup",  color: "#111827", price: 19.0 },
  ],
  // mug -> alias of cup; shoes, headphones, shirt similarly
};
```
Keyword matching: lowercase the query, find the first CATALOG key contained in the query
(also map "mug"->cup, "shirt"->t-shirt aliases). If NO keyword matches, fall back to two
generic variants of the typed noun: "Blue {item}" (#3B82F6, $24.0) / "White {item}" (#E5E7EB, $19.0),
where {item} is the trimmed query (default "Item" if empty). Implement as a
`resolveVariants(query: string): ProductVariant[]` helper.

STEP UI:

1. request — Heading copy ("What would you like the agent to buy?") + a text input
   (placeholder "Ask the agent to buy something… e.g. buy me a cup") + example chips
   ("buy me a cup", "get running shoes", "order headphones") that set query AND advance.
   A "Continue" / arrow button submits the typed query -> setStep("options"). Disable
   continue when query is empty.

2. options — Show `resolveVariants(query)` as selectable cards in a responsive grid
   (grid-cols-1 sm:grid-cols-2). Each option: a color swatch (rounded, inline
   `style={{ backgroundColor: variant.color }}`), name, price ($x.xx). Clicking selects
   the variant (visual selected ring via border-color JUSPAY_ACCENT) and advances to "card".

3. card — List ALL `cards` from the store as selectable rows: a colored dot
   (inline style card.color) + IconRenderer(card.icon) + card.label + card.maskedNumber.
   Selecting one sets selectedCardId and advances to "controls". EMPTY STATE: if cards.length === 0,
   show a friendly empty-state ("No payment cards yet") pointing the user to the Payments
   section (plain text/hint — no nav callback needed).

4. controls — Two SettingRows-style rows each with a `<Toggle>`:
   - "Spend limit under control" (limitOn)
   - "MFA required" (mfaOn)
   The "Proceed to Pay" primary button renders ONLY when `limitOn && mfaOn`. Until then,
   show a small gray hint ("Enable both controls to proceed"). Proceed -> setStep("mfa"),
   clear otp + error.

5. mfa — Mirror SimulatePaymentModal challenge UI: indigo callout ("Verify this payment" +
   "This payment of $X exceeds the MFA threshold… Enter the one-time code to approve it."),
   OTP input (type text, inputMode numeric, maxLength 6, tracking-widest text-center,
   placeholder "------"), demo hint line "Demo hint — Enter the code: 123456", inline red
   error block on wrong code. "Verify & pay" button: if otp === DEMO_OTP -> confirmPurchase()
   then setStep("confirmed"); else setError("Incorrect code. Try again.").

6. confirmed — Success screen: a green check (lucide CheckCircle2), product variant name +
   swatch, price, and the card used (label + maskedNumber). A "Shop again" / "Start over"
   button that resets ALL state back to step "request".

confirmPurchase() — record the transaction for realism (per locked decision). Mirror
SimulatePaymentModal.postPayment exactly:
```typescript
function confirmPurchase() {
  const card = cards.find((c) => c.id === selectedCardId);
  if (!card || !variant) return;
  const shopSub = subagents.find((s) => s.name.toLowerCase().includes("shop")) ?? subagents[0];
  addTransaction({
    id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    cardId: card.id,
    subagentId: shopSub?.id ?? "",
    merchant: variant.name,
    amount: variant.price,
    date: new Date().toISOString(),
    status: "completed",
    isSubscription: false,
  });
  updateCard(card.id, { spent: card.spent + variant.price });
}
```

Back navigation: include a subtle "Back" text link at the top of options/card/controls/mfa
steps that moves to the previous step (request has none; confirmed uses Start over instead).
A small breadcrumb/step indicator is OPTIONAL — add only if it stays clean.

Keep everything responsive (mobile-first; the app supports 375px) and use only existing
deps (React, lucide-react, the Toggle/IconRenderer primitives, the store, JUSPAY_ACCENT).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>
ShoppingSection.tsx exists and compiles. It implements all six steps, the catalog +
generic fallback, the both-toggles-gate on Proceed to Pay, the DEMO_OTP challenge with
error on wrong code, the card empty-state, and confirmPurchase recording a transaction +
bumping spent. No new dependencies.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire Shopping into nav and routing</name>
  <files>src/components/settings/navItems.ts, src/components/settings/SettingsContent.tsx</files>
  <action>
1. navItems.ts — Import a shopping lucide icon (ShoppingBag) and add a NAV_ITEM
   `{ id: "shopping", label: "Shopping", icon: ShoppingBag }` placed IMMEDIATELY AFTER the
   "payments" entry (between payments and data-controls), per locked decision. Reuse of
   ShoppingBag/ShoppingCart elsewhere is fine.

2. SettingsContent.tsx — Import ShoppingSection and add a render branch:
   `if (selected === "shopping") return <ShoppingSection />;` alongside the existing
   general/payments branches in renderBody(). Leave the mobile nav drawer + everything
   else untouched — this is purely additive.
  </action>
  <verify>
    <automated>npm run build && npm test</automated>
  </verify>
  <done>
"Shopping" appears in NAV_ITEMS right after Payments. Selecting it renders ShoppingSection.
`npm run build` is clean (tsc + vite) and `npm test` stays green (24 tests). No existing
section, the mobile drawer, or Subagents/Payments features regress.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>The guided Shopping demo section (request -> options -> card -> controls -> MFA -> confirmed) wired into the settings nav after Payments.</what-built>
  <how-to-verify>
Run `npm run dev` and open the app, then open Settings -> Shopping. Verify three flows:

1. Happy path: type "buy me a cup" (or click a chip) -> Continue -> pick the blue variant ->
   pick a card -> turn ON both toggles (Proceed to Pay should APPEAR only after the second
   toggle flips on) -> Proceed -> enter "123456" -> see the confirmation screen with the
   product, price, and card used. Then open Payments -> Transactions and confirm a new
   transaction (merchant = product name, the variant price) was recorded.
2. Wrong OTP: repeat to the MFA step, enter "000000" -> expect an "Incorrect code" error;
   then "123456" succeeds.
3. Zero-card empty state: in Payments -> Cards, delete all cards (or Reset then delete),
   go back to Shopping, advance to the card step -> expect a friendly empty-state pointing
   to Payments (no crash).

Also sanity-check it on a narrow (mobile ~375px) viewport.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` clean (tsc + vite).
- `npm test` stays green (24 tests).
- Shopping nav item present after Payments; selecting it renders ShoppingSection.
- Manual: happy path, wrong-OTP error, and zero-card empty state all behave (human-verify).
</verification>

<success_criteria>
- A new Shopping section exists in settings nav (after Payments) and renders the full
  six-step guided purchase flow.
- Proceed to Pay gated on BOTH toggles; MFA challenge accepts "123456" and errors otherwise.
- On confirm, a transaction is recorded and card spent increases.
- No regressions to existing sections, mobile drawer, or Payments/Subagents features.
</success_criteria>

<output>
After completion, create `.planning/quick/260609-npa-add-a-guided-shopping-commerce-demo-sect/260609-npa-SUMMARY.md`
</output>
