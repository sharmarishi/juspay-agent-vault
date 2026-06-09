import React from "react";
import type { Card } from "../../data/types";
import { Modal } from "../primitives/Modal";
import { CardVisual } from "./CardVisual";
import { useVaultStore } from "../../store/useVaultStore";

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  const transactions = useVaultStore((s) => s.transactions);
  const updateCard = useVaultStore((s) => s.updateCard);
  const removeCard = useVaultStore((s) => s.removeCard);

  if (!card) {
    return <Modal open={false} onClose={onClose} title="Card">{null}</Modal>;
  }

  const cardTxns = transactions
    .filter((t) => t.cardId === card.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const spendPercent = card.limit > 0 ? Math.min(100, (card.spent / card.limit) * 100) : 0;

  const statusColor = {
    completed: { bg: "bg-green-100", text: "text-green-700" },
    pending: { bg: "bg-amber-100", text: "text-amber-700" },
    declined: { bg: "bg-red-100", text: "text-red-700" },
  } as const;

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={card.label}
      widthClass="w-[min(560px,calc(100vw-48px))]"
    >
      {/* 1. Large card visual */}
      <div className="mb-5">
        <CardVisual card={card} />
      </div>

      {/* 2. Spend-vs-limit indicator */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">Spent this period</span>
          <span className="text-sm text-gray-600">
            ${card.spent.toFixed(2)} / ${card.limit.toLocaleString()}
          </span>
        </div>
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${spendPercent}%`, backgroundColor: card.color }}
          />
        </div>
      </div>

      {/* 3. Settings — READ-ONLY this phase */}
      <div className="mb-5 border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Settings
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-600">Spending limit</span>
            <span className="text-sm font-medium text-gray-900">${card.limit.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-600">MFA threshold</span>
            <span className="text-sm font-medium text-gray-900">${card.mfaThreshold}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-600">MFA enforcement</span>
            <span className="text-sm font-medium text-gray-900">
              {card.mfaEnabled ? "On" : "Off"}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-600">Status</span>
            <span className="text-sm font-medium text-gray-900">
              {card.status === "active" ? "Active" : "Frozen"}
            </span>
          </div>
        </div>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <span className="text-xs text-gray-400">Editable in a later step.</span>
        </div>
      </div>

      {/* 4. Recent activity */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">Recent activity</p>
        {cardTxns.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {cardTxns.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-2.5 gap-2">
                {/* Left: merchant + date + subscription pill */}
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

      {/* 5. Actions: freeze/unfreeze + delete */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
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
          onClick={() => {
            removeCard(card.id);
            onClose();
          }}
          className="text-xs border border-red-300 rounded-full px-3 py-1 text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete card
        </button>
      </div>
    </Modal>
  );
}
