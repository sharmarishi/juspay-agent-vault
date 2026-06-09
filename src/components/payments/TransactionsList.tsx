import React, { useState } from "react";
import { useVaultStore } from "../../store/useVaultStore";
import { JUSPAY_ACCENT } from "../../theme/tokens";

const statusColor = {
  completed: { bg: "bg-green-100", text: "text-green-700" },
  pending:   { bg: "bg-amber-100",  text: "text-amber-700" },
  declined:  { bg: "bg-red-100",    text: "text-red-700" },
} as const;

export function TransactionsList() {
  const transactions = useVaultStore((s) => s.transactions);
  const cards        = useVaultStore((s) => s.cards);
  const subagents    = useVaultStore((s) => s.subagents);

  const [filter, setFilter] = useState<"all" | "subscriptions">("all");

  // Resolution helpers
  const cardLabel = (cardId: string) =>
    cards.find((c) => c.id === cardId)?.label ?? "Unknown card";
  const subagentName = (subagentId: string) =>
    subagents.find((s) => s.id === subagentId)?.name ?? "";

  // Build sorted + filtered list (TXN-02: newest first across all cards)
  const sorted  = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const visible =
    filter === "subscriptions" ? sorted.filter((t) => t.isSubscription) : sorted;

  return (
    <div className="flex flex-col gap-3">
      {/* Filter pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs rounded-full px-3 py-1 transition-colors ${
            filter === "all"
              ? "text-white"
              : "border border-gray-300 text-gray-600"
          }`}
          style={filter === "all" ? { backgroundColor: JUSPAY_ACCENT } : undefined}
        >
          All
        </button>
        <button
          onClick={() => setFilter("subscriptions")}
          className={`text-xs rounded-full px-3 py-1 transition-colors ${
            filter === "subscriptions"
              ? "text-white"
              : "border border-gray-300 text-gray-600"
          }`}
          style={
            filter === "subscriptions" ? { backgroundColor: JUSPAY_ACCENT } : undefined
          }
        >
          Subscriptions
        </button>
      </div>

      {/* Transactions list */}
      {visible.length === 0 ? (
        <p className="text-sm text-gray-400">No transactions.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {visible.map((t) => (
            <li
              key={t.id}
              className="flex items-start justify-between px-4 py-2.5 gap-2"
            >
              {/* Left: merchant + subagent pill + subscription pill + card/date line */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm text-gray-900 truncate">{t.merchant}</span>
                  {t.isSubscription && (
                    <span className="text-[10px] bg-gray-100 rounded-full px-2 py-0.5 text-gray-500 shrink-0">
                      Subscription
                    </span>
                  )}
                  {subagentName(t.subagentId) && (
                    <span
                      className="text-[10px] rounded-full px-2 py-0.5 font-medium shrink-0"
                      style={{
                        color: JUSPAY_ACCENT,
                        backgroundColor: JUSPAY_ACCENT + "14",
                      }}
                    >
                      {subagentName(t.subagentId)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[cardLabel(t.cardId), t.date]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {/* Right: amount + status chip */}
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
          ))}
        </ul>
      )}
    </div>
  );
}
