import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, ArrowRight, Send, Sparkles } from "lucide-react";
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
    { id: "cup-blue", name: "Blue Ceramic Mug", color: "#3B82F6", price: 14.0 },
    { id: "cup-white", name: "White Ceramic Mug", color: "#E5E7EB", price: 12.0 },
    { id: "cup-black", name: "Black Travel Cup", color: "#111827", price: 19.0 },
  ],
  shoes: [
    { id: "shoes-white", name: "White Running Shoes", color: "#F9FAFB", price: 89.0 },
    { id: "shoes-black", name: "Black Athletic Shoes", color: "#111827", price: 79.0 },
    { id: "shoes-blue", name: "Blue Trail Runners", color: "#3B82F6", price: 99.0 },
  ],
  headphones: [
    { id: "hp-black", name: "Black Over-Ear Headphones", color: "#111827", price: 149.0 },
    { id: "hp-white", name: "White Wireless Headphones", color: "#E5E7EB", price: 129.0 },
    { id: "hp-indigo", name: "Indigo Sport Earbuds", color: "#4F46E5", price: 69.0 },
  ],
  shirt: [
    { id: "shirt-white", name: "White Cotton T-Shirt", color: "#F9FAFB", price: 24.0 },
    { id: "shirt-black", name: "Black Classic T-Shirt", color: "#111827", price: 22.0 },
    { id: "shirt-blue", name: "Blue Graphic T-Shirt", color: "#3B82F6", price: 27.0 },
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
  for (const key of Object.keys(CATALOG)) {
    if (q.includes(key)) return CATALOG[key];
  }
  for (const [alias, target] of Object.entries(ALIASES)) {
    if (q.includes(alias)) return CATALOG[target];
  }
  const noun = q || "Item";
  const label = noun.charAt(0).toUpperCase() + noun.slice(1);
  return [
    { id: `gen-blue-${noun}`, name: `Blue ${label}`, color: "#3B82F6", price: 24.0 },
    { id: `gen-white-${noun}`, name: `White ${label}`, color: "#E5E7EB", price: 19.0 },
  ];
}

type Step = "request" | "options" | "card" | "controls" | "mfa" | "confirmed";
const ORDER: Step[] = ["request", "options", "card", "controls", "mfa", "confirmed"];

const EXAMPLE_CHIPS = ["buy me a cup", "get running shoes", "order headphones"];

// ── Chat bubble primitives ───────────────────────────────────────────────────
function AgentTurn({
  text,
  children,
}: {
  text?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5 items-start">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
        style={{ backgroundColor: JUSPAY_ACCENT }}
      >
        <Sparkles size={15} />
      </div>
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {text && (
          <div className="self-start max-w-[90%] rounded-2xl rounded-tl-sm bg-gray-100 px-3.5 py-2.5 text-sm text-gray-800">
            {text}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[85%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm text-white"
        style={{ backgroundColor: JUSPAY_ACCENT }}
      >
        {children}
      </div>
    </div>
  );
}

export function ShoppingSection() {
  const cards = useVaultStore((s) => s.cards);
  const subagents = useVaultStore((s) => s.subagents);
  const addTransaction = useVaultStore((s) => s.addTransaction);
  const updateCard = useVaultStore((s) => s.updateCard);

  const [step, setStep] = useState<Step>("request");
  const [composer, setComposer] = useState("");
  const [query, setQuery] = useState("");
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [limitOn, setLimitOn] = useState(false);
  const [mfaOn, setMfaOn] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const stepGte = (s: Step) => ORDER.indexOf(step) >= ORDER.indexOf(s);

  // Auto-scroll the transcript to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [step, variant, selectedCardId, error]);

  function resetAll() {
    setStep("request");
    setComposer("");
    setQuery("");
    setVariant(null);
    setSelectedCardId(null);
    setLimitOn(false);
    setMfaOn(false);
    setOtp("");
    setError("");
  }

  function sendQuery(text: string) {
    const q = text.trim();
    if (!q) return;
    setQuery(q);
    setComposer("");
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

  function handleProceed() {
    setOtp("");
    setError("");
    setStep("mfa");
  }

  function confirmPurchase() {
    const card = cards.find((c) => c.id === selectedCardId);
    if (!card || !variant) return;
    const shopSub =
      subagents.find((s) => s.name.toLowerCase().includes("shop")) ?? subagents[0];
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
  const composerActive = step === "request";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Transcript */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pb-2 pr-1">
        {/* Greeting + example chips */}
        <AgentTurn text="Hi! I'm your shopping agent. Tell me what to buy and I'll handle the checkout securely.">
          {step === "request" && (
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendQuery(chip)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </AgentTurn>

        {/* User request */}
        {query && <UserBubble>{query}</UserBubble>}

        {/* Options */}
        {stepGte("options") && (
          <AgentTurn text={`Here are a few options for "${query}". Which one would you like?`}>
            {!variant && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {resolveVariants(query).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVariant(v)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex-shrink-0 border border-gray-200"
                      style={{ backgroundColor: v.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">${v.price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </AgentTurn>
        )}

        {/* User picks variant */}
        {variant && (
          <UserBubble>
            I'll take the {variant.name} — ${variant.price.toFixed(2)}
          </UserBubble>
        )}

        {/* Card selection */}
        {stepGte("card") &&
          (cards.length === 0 ? (
            <AgentTurn text="You don't have any payment cards yet. Add one in the Payments section, then come back to shop." />
          ) : (
            <AgentTurn text="Which card should I use for this purchase?">
              {!selectedCardId && (
                <div className="flex flex-col gap-2">
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleSelectCard(card.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: card.color }}
                      />
                      <IconRenderer name={card.icon} size={16} className="text-gray-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-900 truncate flex-1">{card.label}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{card.maskedNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </AgentTurn>
          ))}

        {/* User picks card */}
        {selectedCard && (
          <UserBubble>
            Use {selectedCard.label} {selectedCard.maskedNumber}
          </UserBubble>
        )}

        {/* Controls */}
        {stepGte("controls") && selectedCard && (
          <AgentTurn text="Before I pay, please confirm your security controls:">
            <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Spend limit under control</p>
                  <p className="text-xs text-gray-500 mt-0.5">Keep this card within its spending limit</p>
                </div>
                <Toggle checked={limitOn} onChange={step === "controls" ? setLimitOn : () => {}} />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">MFA required</p>
                  <p className="text-xs text-gray-500 mt-0.5">Require a one-time code to approve the payment</p>
                </div>
                <Toggle checked={mfaOn} onChange={step === "controls" ? setMfaOn : () => {}} />
              </div>
            </div>
            {step === "controls" &&
              (limitOn && mfaOn ? (
                <button
                  onClick={handleProceed}
                  className="self-start flex items-center gap-1.5 text-sm rounded-full px-5 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: JUSPAY_ACCENT }}
                >
                  Proceed to Pay
                  <ArrowRight size={15} />
                </button>
              ) : (
                <p className="text-xs text-gray-400">Enable both controls to proceed.</p>
              ))}
          </AgentTurn>
        )}

        {/* User proceeds */}
        {stepGte("mfa") && <UserBubble>Proceed to pay</UserBubble>}

        {/* MFA challenge */}
        {stepGte("mfa") && step !== "confirmed" && (
          <AgentTurn
            text={`This payment of $${variant?.price.toFixed(2) ?? "0.00"} needs your approval. Enter the one-time code to authorize it.`}
          >
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-2">
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
              <p className="text-xs text-gray-400 text-center">Demo hint — enter the code: {DEMO_OTP}</p>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <button
                onClick={handleVerify}
                className="w-full text-sm rounded-full px-4 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: JUSPAY_ACCENT }}
              >
                Verify &amp; pay
              </button>
            </div>
          </AgentTurn>
        )}

        {/* Confirmation */}
        {step === "confirmed" && (
          <AgentTurn>
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={22} className="text-green-500 shrink-0" />
                <p className="text-sm font-semibold text-gray-900">Order confirmed!</p>
              </div>
              {variant && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                  <span
                    className="w-6 h-6 rounded-md flex-shrink-0 border border-gray-200"
                    style={{ backgroundColor: variant.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{variant.name}</p>
                    <p className="text-xs text-gray-500">${variant.price.toFixed(2)}</p>
                  </div>
                </div>
              )}
              {selectedCard && (
                <p className="text-xs text-gray-500">
                  Paid with <span className="font-medium text-gray-700">{selectedCard.label}</span>{" "}
                  {selectedCard.maskedNumber} · recorded in Payments → Transactions.
                </p>
              )}
              <button
                onClick={resetAll}
                className="self-start text-sm rounded-full px-5 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: JUSPAY_ACCENT }}
              >
                Shop again
              </button>
            </div>
          </AgentTurn>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="pt-3 mt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
          <input
            type="text"
            value={composer}
            disabled={!composerActive}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendQuery(composer)}
            placeholder={
              composerActive
                ? "Ask the agent to buy something… e.g. buy me a cup"
                : step === "confirmed"
                ? "Tap “Shop again” to start a new order"
                : "Continue with the options above"
            }
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed px-1"
          />
          <button
            onClick={() => sendQuery(composer)}
            disabled={!composerActive || !composer.trim()}
            aria-label="Send"
            className="flex items-center justify-center h-8 w-8 rounded-full text-white shrink-0 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: JUSPAY_ACCENT }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
