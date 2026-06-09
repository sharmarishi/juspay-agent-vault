import React, { useState } from "react";
import { PoweredByJuspay } from "../components/branding/PoweredByJuspay";
import { CardVisual } from "../components/cards/CardVisual";
import { useVaultStore } from "../store/useVaultStore";
import { JUSPAY_ACCENT } from "../theme/tokens";

export function PaymentsSection() {
  const cards = useVaultStore((s) => s.cards);
  const reset = useVaultStore((s) => s.reset);
  const updateCard = useVaultStore((s) => s.updateCard);
  const removeCard = useVaultStore((s) => s.removeCard);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage cards your ChatGPT apps use.
          </p>
        </div>

        {/* Add card button — wired in 02-02 */}
        <button
          onClick={() => {}} // wired in 02-02
          className="flex-shrink-0 text-sm rounded-full px-4 py-1.5 text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: JUSPAY_ACCENT }}
        >
          + Add card
        </button>
      </div>

      {/* Card grid */}
      {cards.length === 0 ? (
        <p className="text-sm text-gray-400">No cards yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div key={card.id}>
              <CardVisual card={card} />

              {/* Action row */}
              <div className="flex items-center gap-2 mt-2">
                {confirmDeleteId === card.id ? (
                  /* Confirm delete prompt */
                  <>
                    <span className="text-xs text-gray-600 mr-1">Delete this card?</span>
                    <button
                      onClick={() => {
                        removeCard(card.id);
                        setConfirmDeleteId(null);
                      }}
                      className="text-xs border border-red-300 rounded-full px-3 py-1 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs border border-gray-300 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  /* Normal freeze/delete buttons */
                  <>
                    <button
                      onClick={() =>
                        updateCard(card.id, {
                          status: card.status === "active" ? "frozen" : "active",
                        })
                      }
                      className="text-xs border border-gray-300 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {card.status === "frozen" ? "Unfreeze" : "Freeze"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(card.id)}
                      className="text-xs border border-gray-300 rounded-full px-3 py-1 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
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
