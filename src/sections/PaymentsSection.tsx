import React, { useState } from "react";
import { PoweredByJuspay } from "../components/branding/PoweredByJuspay";
import { CardVisual } from "../components/cards/CardVisual";
import { AddCardModal } from "../components/cards/AddCardModal";
import { CardDetailModal } from "../components/cards/CardDetailModal";
import { DashboardOverview } from "../components/payments/DashboardOverview";
import { TransactionsList } from "../components/payments/TransactionsList";
import { useVaultStore } from "../store/useVaultStore";
import { JUSPAY_ACCENT } from "../theme/tokens";
import type { Card } from "../data/types";

export function PaymentsSection() {
  const cards = useVaultStore((s) => s.cards);
  const reset = useVaultStore((s) => s.reset);
  const updateCard = useVaultStore((s) => s.updateCard);
  const removeCard = useVaultStore((s) => s.removeCard);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [detailCard, setDetailCard] = useState<Card | null>(null);
  const [tab, setTab] = useState<"overview" | "cards" | "transactions">("overview");

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* Title is rendered by the settings shell (SettingsContent h1) — only the subtitle here */}
          <p className="text-sm text-gray-500">
            Manage cards your ChatGPT apps use.
          </p>
        </div>

        {/* Right: brand mark (top-right) + Add card button — visible on all tabs */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <PoweredByJuspay />
          <button
            onClick={() => setAddOpen(true)}
            className="text-sm rounded-full px-4 py-1.5 text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: JUSPAY_ACCENT }}
          >
            + Add card
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-gray-100 overflow-x-auto">
        {(
          [
            { key: "overview",      label: "Overview" },
            { key: "cards",         label: "Cards" },
            { key: "transactions",  label: "Transactions" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-sm px-3 py-2 -mb-px border-b-2 transition-colors flex-shrink-0 whitespace-nowrap ${
              tab === key
                ? "border-current font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={
              tab === key
                ? { color: JUSPAY_ACCENT, borderColor: JUSPAY_ACCENT }
                : undefined
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <DashboardOverview />}

      {tab === "transactions" && <TransactionsList />}

      {tab === "cards" && (
        <>
          {/* Card grid — physical cards only; virtual cards accessible via drill-down */}
          {(() => {
            const physicalCards = cards.filter((c) => c.type === "physical");
            return physicalCards.length === 0 ? (
              <p className="text-sm text-gray-400">No cards yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {physicalCards.map((card) => (
                  <div key={card.id}>
                    <CardVisual card={card} onClick={() => setDetailCard(card)} />

                    {/* Action row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
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
            );
          })()}

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
        </>
      )}

      {/* Modals — mounted outside tab switch so they work from Cards tab */}
      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} />
      <CardDetailModal
        card={detailCard}
        onClose={() => setDetailCard(null)}
        onSelectCard={(c) => setDetailCard(c)}
      />
    </div>
  );
}
