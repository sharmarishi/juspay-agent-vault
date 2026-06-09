import React, { useState } from "react";
import { Modal } from "../primitives/Modal";
import { useVaultStore } from "../../store/useVaultStore";
import { JUSPAY_ACCENT } from "../../theme/tokens";
import type { Card } from "../../data/types";

const DEMO_OTP = "123456";

interface SimulatePaymentModalProps {
  cardId: string | null; // null = closed
  onClose: () => void;
}

export function SimulatePaymentModal({ cardId, onClose }: SimulatePaymentModalProps) {
  const cards = useVaultStore((s) => s.cards);
  const apps = useVaultStore((s) => s.apps);
  const addTransaction = useVaultStore((s) => s.addTransaction);
  const updateCard = useVaultStore((s) => s.updateCard);

  const card: Card | null = cards.find((c) => c.id === cardId) ?? null;

  const [step, setStep] = useState<"form" | "challenge">("form");
  const [amount, setAmount] = useState<string>("");
  const [appId, setAppId] = useState<string>(apps[0]?.id ?? "");
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!cardId || !card) {
    return (
      <Modal open={false} onClose={onClose} title="Simulate a payment">
        {null}
      </Modal>
    );
  }

  function postPayment(amt: number) {
    if (!card) return;
    const app = apps.find((a) => a.id === appId);
    addTransaction({
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      cardId: card.id,
      appId: appId,
      merchant: app?.name ?? "Unknown",
      amount: amt,
      date: new Date().toISOString(),
      status: "completed",
      isSubscription: false,
    });
    updateCard(card.id, { spent: card.spent + amt });
    onClose();
  }

  function handleFormSubmit() {
    const amt = Number(amount);

    // 1. Validate amount
    if (!isFinite(amt) || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    // 2. Frozen check (SEC-04)
    if (card!.status === "frozen") {
      setError("This card is frozen.");
      return;
    }

    // 3. Over-limit check (SEC-04)
    if (card!.spent + amt > card!.limit) {
      setError("This payment would exceed the card's spending limit.");
      return;
    }

    // 4. MFA challenge (SEC-02)
    if (card!.mfaEnabled && amt > card!.mfaThreshold) {
      setError("");
      setStep("challenge");
      return;
    }

    // 5. Direct post — below threshold or MFA off
    postPayment(amt);
  }

  function handleVerify() {
    if (otp === DEMO_OTP) {
      postPayment(Number(amount));
    } else {
      setError("Incorrect code. Try again.");
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Simulate a payment"
      widthClass="w-[min(440px,calc(100vw-48px))]"
    >
      {step !== "challenge" ? (
        <div className="space-y-4">
          {/* Amount input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
              <span className="pl-3 pr-1 text-sm text-gray-500 select-none">$</span>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="0.00"
                className="flex-1 py-2.5 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* App / merchant picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              App / Merchant
            </label>
            <select
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {/* Inline error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleFormSubmit}
            className="w-full text-sm rounded-full px-4 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: JUSPAY_ACCENT }}
          >
            Simulate payment
          </button>
        </div>
      ) : (
        /* step === "challenge" — SEC-03 */
        <div className="space-y-4">
          {/* MFA callout block */}
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-4">
            <p className="text-sm font-semibold text-indigo-800 mb-1">Verify this payment</p>
            <p className="text-sm text-indigo-700">
              This payment of ${Number(amount).toFixed(2)} exceeds the MFA threshold for this
              card. Enter the one-time code to approve it.
            </p>
          </div>

          {/* OTP input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              One-time code
            </label>
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
            {/* Demo hint */}
            <p className="mt-1.5 text-xs text-gray-400 text-center">
              Demo hint — Enter the code: {DEMO_OTP}
            </p>
          </div>

          {/* Inline error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Verify & Cancel buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleVerify}
              className="flex-1 text-sm rounded-full px-4 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: JUSPAY_ACCENT }}
            >
              Verify &amp; pay
            </button>
            <button
              onClick={onClose}
              className="flex-1 text-sm rounded-full px-4 py-2.5 text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
