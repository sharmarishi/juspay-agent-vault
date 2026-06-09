import React from "react";
import { useVaultStore } from "../../store/useVaultStore";
import { IconRenderer } from "../cards/IconRenderer";

interface AppUsageBreakdownProps {
  cardId: string;
}

export function AppUsageBreakdown({ cardId }: AppUsageBreakdownProps) {
  const transactions = useVaultStore((s) => s.transactions);
  const apps = useVaultStore((s) => s.apps);

  // Filter to this card's transactions
  const cardTxns = transactions.filter((t) => t.cardId === cardId);

  // Group by appId, sum amount and count
  const totals = new Map<string, { total: number; count: number }>();
  for (const t of cardTxns) {
    const existing = totals.get(t.appId);
    if (existing) {
      existing.total += t.amount;
      existing.count += 1;
    } else {
      totals.set(t.appId, { total: t.amount, count: 1 });
    }
  }

  // Resolve app names/icons and sort by spend descending
  const rows = Array.from(totals.entries())
    .map(([appId, agg]) => {
      const app = apps.find((a) => a.id === appId);
      return {
        appId,
        name: app?.name ?? "Unknown app",
        icon: app?.icon ?? "CreditCard",
        total: agg.total,
        count: agg.count,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">Used by apps</p>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">No app usage yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {rows.map((r) => (
            <li
              key={r.appId}
              className="flex items-center justify-between px-4 py-2.5 gap-2"
            >
              {/* Left: icon chip + app name + transaction count */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="bg-gray-100 rounded-lg p-1.5 shrink-0">
                  <IconRenderer name={r.icon} size={18} className="text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">
                    {r.count} transaction{r.count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {/* Right: total spent */}
              <span className="text-sm font-medium text-gray-900 shrink-0">
                ${r.total.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
