import React from "react";
import { PoweredByJuspay } from "../components/branding/PoweredByJuspay";
import { useVaultStore } from "../store/useVaultStore";

export function PaymentsSection() {
  const cards = useVaultStore((s) => s.cards);
  const reset = useVaultStore((s) => s.reset);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage cards your ChatGPT apps use.
        </p>
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-gray-400">No cards yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
            >
              {/* Color swatch */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: card.color }}
              />

              {/* Card info */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800">
                  {card.label}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {card.maskedNumber}
                </span>
              </div>

              {/* Status badge */}
              {card.status === "active" ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Active
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  Frozen
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Reset demo */}
      <div className="flex flex-col gap-1 pt-2">
        <button
          onClick={reset}
          className="self-start text-sm border border-gray-300 rounded-full px-4 py-1.5 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset demo
        </button>
        <p className="text-xs text-gray-400">
          Restore the original seeded demo data.
        </p>
      </div>

      <PoweredByJuspay />
    </div>
  );
}
