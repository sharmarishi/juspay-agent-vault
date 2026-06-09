import React from "react";
import { useVaultStore } from "../../store/useVaultStore";
import { JUSPAY_ACCENT } from "../../theme/tokens";

const statusColor = {
  completed: { bg: "bg-green-100", text: "text-green-700" },
  pending:   { bg: "bg-amber-100",  text: "text-amber-700" },
  declined:  { bg: "bg-red-100",    text: "text-red-700" },
} as const;

export function DashboardOverview() {
  const cards = useVaultStore((s) => s.cards);
  const transactions = useVaultStore((s) => s.transactions);

  // --- Derived stats ---
  const totalCards  = cards.length;
  const activeCount = cards.filter((c) => c.status === "active").length;
  const frozenCount = totalCards - activeCount;

  const totalSpent = cards.reduce((s, c) => s + c.spent, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);

  const mfaOnCount  = cards.filter((c) => c.mfaEnabled).length;
  const mfaOffCards = cards.filter((c) => !c.mfaEnabled);

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tile 1: Cards */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Cards
          </p>
          <p className="text-xl font-semibold text-gray-900">{totalCards}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {activeCount} active · {frozenCount} frozen
          </p>
        </div>

        {/* Tile 2: Total spent */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Total spent
          </p>
          <p className="text-xl font-semibold text-gray-900">
            ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            of ${totalLimit.toLocaleString(undefined, { maximumFractionDigits: 0 })} limit
          </p>
        </div>

        {/* Tile 3: MFA protection */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            MFA protection
          </p>
          <p className="text-xl font-semibold" style={{ color: JUSPAY_ACCENT }}>
            {mfaOnCount}/{totalCards}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">cards with MFA on</p>
        </div>
      </div>

      {/* MFA nudge (DASH-02) */}
      {mfaOffCards.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          MFA is off on {mfaOffCards.length} card{mfaOffCards.length !== 1 ? "s" : ""}:{" "}
          {mfaOffCards.map((c) => c.label).join(", ")}
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          All cards have MFA enabled.
        </div>
      )}

      {/* Recent transactions */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Recent transactions</p>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-4 py-2.5 gap-2"
              >
                {/* Left: merchant + subscription pill + date */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm text-gray-900 truncate">{t.merchant}</span>
                    {t.isSubscription && (
                      <span className="text-[10px] bg-gray-100 rounded-full px-2 py-0.5 text-gray-500 shrink-0">
                        Subscription
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{t.date}</p>
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
    </div>
  );
}
