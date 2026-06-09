import React, { useState } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { useVaultStore } from "../store/useVaultStore";
import { Toggle } from "../components/primitives/Toggle";
import { IconRenderer } from "../components/cards/IconRenderer";
import { JUSPAY_ACCENT } from "../theme/tokens";

const DEMO_OTP = "123456";

interface ProductVariant {
  id: string;
  name: string;
  color: string;
  price: number;
}

const CATALOG: Record<string, ProductVariant[]> = {
  cup: [
    { id: "cup-blue",  name: "Blue Ceramic Mug",   color: "#3B82F6", price: 14.0 },
    { id: "cup-white", name: "White Ceramic Mug",  color: "#E5E7EB", price: 12.0 },
    { id: "cup-black", name: "Black Travel Cup",   color: "#111827", price: 19.0 },
  ],
  shoes: [
    { id: "shoes-white", name: "White Running Shoes", color: "#F9FAFB", price: 89.0 },
    { id: "shoes-black", name: "Black Athletic Shoes", color: "#111827", price: 79.0 },
    { id: "shoes-blue",  name: "Blue Trail Runners",   color: "#3B82F6", price: 99.0 },
  ],
  headphones: [
    { id: "hp-black",  name: "Black Over-Ear Headphones", color: "#111827", price: 149.0 },
    { id: "hp-white",  name: "White Wireless Headphones",  color: "#E5E7EB", price: 129.0 },
    { id: "hp-indigo", name: "Indigo Sport Earbuds",       color: "#4F46E5", price: 69.0 },
  ],
  shirt: [
    { id: "shirt-white", name: "White Cotton T-Shirt",  color: "#F9FAFB", price: 24.0 },
    { id: "shirt-black", name: "Black Classic T-Shirt",  color: "#111827", price: 22.0 },
    { id: "shirt-blue",  name: "Blue Graphic T-Shirt",   color: "#3B82F6", price: 27.0 },
  ],
};

// Aliases: query keyword -> catalog key
const ALIASES: Record<string, string> = {
  mug: "cup",
  "t-shirt": "shirt",
  tshirt: "shirt",
  "running shoes": "shoes",
  sneakers: "shoes",
  runners: "shoes",
  earbuds: "headphones",
  earphones: "headphones",
};

function resolveVariants(query: string): ProductVariant[] {
  const q = query.toLowerCase().trim();

  // Direct catalog key match
  for (const key of Object.keys(CATALOG)) {
    if (q.includes(key)) return CATALOG[key];
  }

  // Alias match
  for (const [alias, target] of Object.entries(ALIASES)) {
    if (q.includes(alias)) return CATALOG[target];
  }

  // Generic fallback
  const noun = q || "Item";
  const label = noun.charAt(0).toUpperCase() + noun.slice(1);
  return [
    { id: `gen-blue-${noun}`,  name: `Blue ${label}`,  color: "#3B82F6", price: 24.0 },
    { id: `gen-white-${noun}`, name: `White ${label}`, color: "#E5E7EB", price: 19.0 },
  ];
}

type Step = "request" | "options" | "card" | "controls" | "mfa" | "confirmed";

const EXAMPLE_CHIPS = [
  "buy me a cup",
  "get running shoes",
  "order headphones",
];

export function ShoppingSection() {
  const cards = useVaultStore((s) => s.cards);
  const subagents = useVaultStore((s) => s.subagents);
  const addTransaction = useVaultStore((s) => s.addTransaction);
  const updateCard = useVaultStore((s) => s.updateCard);

  const [step, setStep] = useState<Step>("request");
  const [query, setQuery] = useState("");
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [limitOn, setLimitOn] = useState(false);
  const [mfaOn, setMfaOn] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  function resetAll() {
    setStep("request");
    setQuery("");
    setVariant(null);
    setSelectedCardId(null);
    setLimitOn(false);
    setMfaOn(false);
    setOtp("");
    setError("");
  }

  function handleChip(chip: string) {
    setQuery(chip);
    setStep("options");
  }

  function handleContinue() {
    if (!query.trim()) return;
    setStep("options");
  }

  function handleSelectVariant(v: ProductVariant) {
    setVariant(v);
    setStep("card");
  }

  function handleSelectCard(id: string) {
    setSelectedCardId(id);
    setStep("controls");
  }

  function handleProceedToMfa() {
    setOtp("");
    setError("");
    setStep("mfa");
  }

  function confirmPurchase() {
    const card = cards.find((c) => c.id === selectedCardId);
    if (!card || !variant) return;
    const shopSub =
      subagents.find((s) => s.name.toLowerCase().includes("shop")) ??
      subagents[0];
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

  function handleVerify() {
    if (otp === DEMO_OTP) {
      confirmPurchase();
      setStep("confirmed");
    } else {
      setError("Incorrect code. Try again.");
    }
  }

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  // ── Back link ────────────────────────────────────────────────────────────
  const BACK_MAP: Partial<Record<Step, Step>> = {
    options: "request",
    card: "options",
    controls: "card",
    mfa: "controls",
  };

  function BackLink() {
    const target = BACK_MAP[step];
    if (!target) return null;
    return (
      <button
        onClick={() => setStep(target)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>
    );
  }

  // ── Step: request ────────────────────────────────────────────────────────
  if (step === "request") {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            What would you like the agent to buy?
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Type a product request and we'll walk you through a secure agentic
            purchase — ending in the MFA challenge.
          </p>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            placeholder="Ask the agent to buy something… e.g. buy me a cup"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {/* Example chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
          <button
            onClick={handleContinue}
            disabled={!query.trim()}
            className="mt-4 flex items-center gap-1.5 text-sm rounded-full px-5 py-2.5 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: JUSPAY_ACCENT }}
          >
            Continue
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  // ── Step: options ────────────────────────────────────────────────────────
  if (step === "options") {
    const variants = resolveVariants(query);
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Pick a variant
          </p>
          <p className="text-xs text-gray-500 mb-4">
            The agent found these options for "{query}". Choose one to continue.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVariant(v)}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
              >
                {/* Color swatch */}
                <span
                  className="w-8 h-8 rounded-lg flex-shrink-0 border border-gray-200"
                  style={{ backgroundColor: v.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {v.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ${v.price.toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: card ───────────────────────────────────────────────────────────
  if (step === "card") {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Choose a payment card
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Select the card you want to use for this purchase.
          </p>
          {cards.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm font-medium text-gray-700 mb-1">
                No payment cards yet
              </p>
              <p className="text-xs text-gray-500">
                Go to the{" "}
                <span className="font-medium text-gray-700">Payments</span>{" "}
                section to add a card, then come back to shop.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card.id)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                >
                  {/* Colored dot */}
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: card.color }}
                  />
                  <IconRenderer name={card.icon} size={16} className="text-gray-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {card.label}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {card.maskedNumber}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step: controls ───────────────────────────────────────────────────────
  if (step === "controls") {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
          {/* Spend limit row */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Spend limit under control
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Ensure this card has a spending limit set
              </p>
            </div>
            <Toggle checked={limitOn} onChange={setLimitOn} />
          </div>
          {/* MFA row */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-gray-900">MFA required</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Require a one-time code to approve the payment
              </p>
            </div>
            <Toggle checked={mfaOn} onChange={setMfaOn} />
          </div>
        </div>

        {limitOn && mfaOn ? (
          <button
            onClick={handleProceedToMfa}
            className="flex items-center justify-center gap-1.5 text-sm rounded-full px-5 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: JUSPAY_ACCENT }}
          >
            Proceed to Pay
            <ArrowRight size={15} />
          </button>
        ) : (
          <p className="text-xs text-gray-400 text-center">
            Enable both controls to proceed
          </p>
        )}
      </div>
    );
  }

  // ── Step: mfa ────────────────────────────────────────────────────────────
  if (step === "mfa") {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        {/* Indigo callout */}
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-4">
          <p className="text-sm font-semibold text-indigo-800 mb-1">
            Verify this payment
          </p>
          <p className="text-sm text-indigo-700">
            This payment of ${variant?.price.toFixed(2) ?? "0.00"} exceeds the
            MFA threshold for this card. Enter the one-time code to approve it.
          </p>
        </div>

        {/* OTP input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            One-time code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
            placeholder="------"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="mt-1.5 text-xs text-gray-400 text-center">
            Demo hint — Enter the code: {DEMO_OTP}
          </p>
        </div>

        {/* Inline error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          className="w-full text-sm rounded-full px-4 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: JUSPAY_ACCENT }}
        >
          Verify &amp; pay
        </button>
      </div>
    );
  }

  // ── Step: confirmed ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 p-6 text-center flex flex-col items-center gap-4">
        <CheckCircle2 size={40} className="text-green-500" />
        <div>
          <p className="text-base font-semibold text-gray-900 mb-1">
            Purchase confirmed!
          </p>
          <p className="text-xs text-gray-500">
            Your agent has completed the purchase securely.
          </p>
        </div>

        {/* Product summary */}
        {variant && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 w-full justify-center">
            <span
              className="w-6 h-6 rounded-md flex-shrink-0 border border-gray-200"
              style={{ backgroundColor: variant.color }}
            />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{variant.name}</p>
              <p className="text-xs text-gray-500">${variant.price.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Card used */}
        {selectedCard && (
          <p className="text-xs text-gray-500">
            Paid with{" "}
            <span className="font-medium text-gray-700">
              {selectedCard.label}
            </span>{" "}
            {selectedCard.maskedNumber}
          </p>
        )}

        <button
          onClick={resetAll}
          className="mt-2 text-sm rounded-full px-5 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: JUSPAY_ACCENT }}
        >
          Shop again
        </button>
      </div>
    </div>
  );
}
