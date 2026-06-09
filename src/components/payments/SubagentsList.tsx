import React, { useState } from "react";
import { useVaultStore } from "../../store/useVaultStore";
import { IconRenderer } from "../cards/IconRenderer";
import { JUSPAY_ACCENT } from "../../theme/tokens";
import { ChevronDown } from "lucide-react";

const statusColor = {
  completed: { bg: "bg-green-100", text: "text-green-700" },
  pending:   { bg: "bg-amber-100",  text: "text-amber-700" },
  declined:  { bg: "bg-red-100",    text: "text-red-700" },
} as const;

export function SubagentsList() {
  const subagents = useVaultStore((s) => s.subagents);
  const transactions = useVaultStore((s) => s.transactions);
  const cards = useVaultStore((s) => s.cards);

  // Track which subagent groups are expanded (collapsed by default)
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const cardFor = (cardId: string) => cards.find((c) => c.id === cardId);

  if (subagents.length === 0) {
    return <p className="text-sm text-gray-400">No subagents.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {subagents.map((sg) => {
        const txns = transactions
          .filter((t) => t.subagentId === sg.id)
          .sort((a, b) => b.date.localeCompare(a.date));
        const total = txns.reduce((s, t) => s + t.amount, 0);
        const isOpen = expanded.includes(sg.id);

        return (
          <div
            key={sg.id}
            className="border border-gray-100 rounded-xl overflow-hidden"
          >
            {/* Subagent header — toggles the collapsible transaction list */}
            <button
              onClick={() => toggle(sg.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between px-4 py-3 gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="rounded-lg p-2 shrink-0"
                  style={{ backgroundColor: JUSPAY_ACCENT + "14" }}
                >
                  <IconRenderer name={sg.icon} size={18} className="text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{sg.name}</p>
                  <p className="text-xs text-gray-400">
                    {txns.length} transaction{txns.length === 1 ? "" : "s"} · $
                    {total.toFixed(2)}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-gray-400 shrink-0 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Collapsible transaction list */}
            {isOpen && (
              <div className="border-t border-gray-100">
                {txns.length === 0 ? (
                  <p className="text-sm text-gray-400 px-4 py-3">
                    No transactions yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {txns.map((t) => {
                      const card = cardFor(t.cardId);
                      const usedLabel = card
                        ? `${card.label} · ${card.type === "virtual" ? "Token" : "Card"}`
                        : "Unknown card";
                      return (
                        <li
                          key={t.id}
                          className="flex items-start justify-between px-4 py-2.5 gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm text-gray-900 truncate">
                                {t.merchant}
                              </span>
                              {t.isSubscription && (
                                <span className="text-[10px] bg-gray-100 rounded-full px-2 py-0.5 text-gray-500 shrink-0">
                                  Subscription
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {usedLabel} · {t.date}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-sm font-medium text-gray-900">
                              ${t.amount.toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${statusColor[t.status].bg} ${statusColor[t.status].text}`}
                            >
                              {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
