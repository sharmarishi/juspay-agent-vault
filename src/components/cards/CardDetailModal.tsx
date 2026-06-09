import React, { useState, useEffect } from "react";
import type { Card } from "../../data/types";
import { Modal } from "../primitives/Modal";
import { CardVisual } from "./CardVisual";
import { IconRenderer } from "./IconRenderer";
import { Toggle } from "../primitives/Toggle";
import { useVaultStore } from "../../store/useVaultStore";
import { SimulatePaymentModal } from "./SimulatePaymentModal";
import { JUSPAY_ACCENT } from "../../theme/tokens";
import { AppUsageBreakdown } from "../payments/AppUsageBreakdown";

type DetailTab = "virtual" | "controls" | "usage";

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
  onSelectCard?: (card: Card) => void;
}

export function CardDetailModal({ card, onClose, onSelectCard }: CardDetailModalProps) {
  const cards = useVaultStore((s) => s.cards);
  const transactions = useVaultStore((s) => s.transactions);
  const apps = useVaultStore((s) => s.apps);
  const updateCard = useVaultStore((s) => s.updateCard);
  const removeCard = useVaultStore((s) => s.removeCard);

  const [simulateOpen, setSimulateOpen] = useState(false);
  const [tab, setTab] = useState<DetailTab>("controls");

  // Reset to "controls" whenever the card changes so we never strand on a hidden tab
  useEffect(() => { setTab("controls"); }, [card?.id]);

  if (!card) {
    return <Modal open={false} onClose={onClose} title="Card">{null}</Modal>;
  }

  const liveCard = cards.find((c) => c.id === card.id) ?? card;

  // Tab list is card-type aware: physical cards get all three; virtual cards omit "Virtual cards"
  const visibleTabs: { key: DetailTab; label: string }[] =
    liveCard.type === "physical"
      ? [
          { key: "virtual", label: "Virtual cards" },
          { key: "controls", label: "Controls" },
          { key: "usage", label: "Used by apps" },
        ]
      : [
          { key: "controls", label: "Controls" },
          { key: "usage", label: "Used by apps" },
        ];

  // Belt-and-suspenders: if current tab is not in visible list, fall back to "controls"
  const activeTab: DetailTab =
    visibleTabs.some((t) => t.key === tab) ? tab : "controls";

  // Virtual children for physical cards
  const childCards =
    liveCard.type === "physical"
      ? cards.filter((c) => c.type === "virtual" && c.parentCardId === liveCard.id)
      : [];

  // Parent label for virtual cards
  const parentLabel =
    liveCard.type === "virtual" && liveCard.parentCardId
      ? cards.find((c) => c.id === liveCard.parentCardId)?.label ?? null
      : null;

  const appName = (appId: string) => apps.find((a) => a.id === appId)?.name ?? "";

  const cardTxns = transactions
    .filter((t) => t.cardId === liveCard.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const spendPercent = liveCard.limit > 0 ? Math.min(100, (liveCard.spent / liveCard.limit) * 100) : 0;

  const statusColor = {
    completed: { bg: "bg-green-100", text: "text-green-700" },
    pending: { bg: "bg-amber-100", text: "text-amber-700" },
    declined: { bg: "bg-red-100", text: "text-red-700" },
  } as const;

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={liveCard.label}
      widthClass="w-[min(560px,calc(100vw-48px))]"
    >
      {/* 1. Large card visual */}
      <div className="mb-5">
        <CardVisual card={liveCard} />
      </div>

      {/* 1a. Parent label for virtual cards */}
      {parentLabel && (
        <p className="text-xs text-gray-400 -mt-3 mb-4">
          Issued under <span className="font-medium text-gray-600">{parentLabel}</span>
        </p>
      )}

      {/* 1b. Virtual cards list for physical cards */}
      {liveCard.type === "physical" && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">Virtual cards</p>
          {childCards.length === 0 ? (
            <p className="text-sm text-gray-400">
              No virtual cards yet — create one with + Add card.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {childCards.map((child) => (
                <li key={child.id}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 gap-3 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => onSelectCard?.(child)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="rounded-lg p-1.5 shrink-0"
                        style={{ backgroundColor: `${child.color}22` }}
                      >
                        <IconRenderer name={child.icon} size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{child.label}</p>
                        <p className="text-xs text-gray-400">{child.maskedNumber}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] rounded-full px-2 py-0.5 font-medium shrink-0 ${
                        child.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {child.status === "active" ? "Active" : "Frozen"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 2a. Simulate a payment button — SEC-01 entry point */}
      <div className="mb-4">
        <button
          onClick={() => setSimulateOpen(true)}
          className="text-sm rounded-full px-4 py-1.5 text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: JUSPAY_ACCENT }}
        >
          Simulate a payment
        </button>
      </div>

      {/* 2. Spend-vs-limit indicator */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">Spent this period</span>
          <span className="text-sm text-gray-600">
            ${liveCard.spent.toFixed(2)} / ${liveCard.limit.toLocaleString()}
          </span>
        </div>
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${spendPercent}%`, backgroundColor: liveCard.color }}
          />
        </div>
      </div>

      {/* 3. Settings — editable */}
      <div className="mb-5 border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Settings
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {/* Row A: Spending limit (CTRL-01) */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-600">Spending limit</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <input
                key={liveCard.id}
                type="number"
                min={0}
                defaultValue={liveCard.limit}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  if (isFinite(parsed) && parsed >= 0) {
                    updateCard(liveCard.id, { limit: parsed });
                  }
                }}
                className="border border-gray-200 rounded-lg px-2 py-1 w-28 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row B: MFA threshold (CTRL-02) */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div>
              <span className="text-sm text-gray-600">MFA threshold</span>
              <p className="text-xs text-gray-400">MFA required above this amount.</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <input
                key={liveCard.id}
                type="number"
                min={0}
                defaultValue={liveCard.mfaThreshold}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  if (isFinite(parsed) && parsed >= 0) {
                    updateCard(liveCard.id, { mfaThreshold: parsed });
                  }
                }}
                className="border border-gray-200 rounded-lg px-2 py-1 w-28 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row C: MFA enforcement (CTRL-03) */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-600">MFA enforcement</span>
            <Toggle
              checked={liveCard.mfaEnabled}
              onChange={(v) => updateCard(liveCard.id, { mfaEnabled: v })}
            />
          </div>

          {/* Row D: Status (read-only display) */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-600">Status</span>
            <span className="text-sm font-medium text-gray-900">
              {liveCard.status === "active" ? "Active" : "Frozen"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. App usage breakdown (USAGE-01) */}
      <div className="mb-5">
        <AppUsageBreakdown cardId={liveCard.id} />
      </div>

      {/* 5. Transaction history (TXN-01) */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">Transaction history</p>
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
                  <p className="text-xs text-gray-400 mt-0.5">{appName(t.appId)} · {t.date}</p>
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

      {/* 6. Actions: freeze/unfreeze + delete */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={() =>
            updateCard(liveCard.id, {
              status: liveCard.status === "active" ? "frozen" : "active",
            })
          }
          className="text-xs border border-gray-300 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {liveCard.status === "frozen" ? "Unfreeze" : "Freeze"}
        </button>
        <button
          onClick={() => {
            removeCard(liveCard.id);
            onClose();
          }}
          className="text-xs border border-red-300 rounded-full px-3 py-1 text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete card
        </button>
      </div>

      {/* SimulatePaymentModal — keyed to reset internal state on each open */}
      <SimulatePaymentModal
        cardId={simulateOpen ? liveCard.id : null}
        onClose={() => setSimulateOpen(false)}
        key={simulateOpen ? liveCard.id : "closed"}
      />
    </Modal>
  );
}
