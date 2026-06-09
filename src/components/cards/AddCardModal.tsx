import React, { useState } from "react";
import { Modal } from "../primitives/Modal";
import { IconRenderer } from "./IconRenderer";
import { useVaultStore } from "../../store/useVaultStore";
import {
  USE_CASE_TEMPLATES,
  generateCardId,
  generateMaskedNumber,
} from "../../data/cardTemplates";
import type { UseCase } from "../../data/types";
import { JUSPAY_ACCENT } from "../../theme/tokens";

type Mode = "physical" | "template" | "custom";

// Tokens created via the Create Token form use a fixed default icon (icon picker removed).
const DEFAULT_TOKEN_ICON = "Sparkles";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddCardModal({ open, onClose }: AddCardModalProps) {
  const addCard = useVaultStore((s) => s.addCard);
  const cards = useVaultStore((s) => s.cards);
  const physicalCards = cards.filter((c) => c.type === "physical");

  // Mode switcher
  const [mode, setMode] = useState<Mode>("physical");

  // Physical form state
  const [physNumber, setPhysNumber] = useState("");
  const [physExpiry, setPhysExpiry] = useState("");
  const [physHolder, setPhysHolder] = useState("");

  // Template mode state
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<
    number | null
  >(null);

  // Custom mode state
  const [customLabel, setCustomLabel] = useState("");
  const [customLimit, setCustomLimit] = useState("200");
  const [customColor, setCustomColor] = useState(JUSPAY_ACCENT);

  // Shared: parent physical-card selector for virtual creation modes
  const [parentCardId, setParentCardId] = useState<string>("");

  function resetForm() {
    setMode("physical");
    setPhysNumber("");
    setPhysExpiry("");
    setPhysHolder("");
    setSelectedTemplateIndex(null);
    setCustomLabel("");
    setCustomLimit("200");
    setCustomColor(JUSPAY_ACCENT);
    setParentCardId("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  // ── Physical submit ────────────────────────────────────────────────────────
  function handlePhysicalSubmit() {
    const last4 = physNumber.replace(/\D/g, "").slice(-4).padStart(4, "0");
    addCard({
      id: generateCardId("general"),
      type: "physical",
      useCase: "general",
      label: physHolder
        ? `${physHolder.split(" ")[0]}'s Card`
        : "Personal",
      maskedNumber: `•••• ${last4}`,
      status: "active",
      limit: 5000,
      spent: 0,
      mfaThreshold: 200,
      mfaEnabled: true,
      color: "#1a1a2e",
      icon: "CreditCard",
      holder: physHolder,
      expiry: physExpiry,
    });
    handleClose();
  }

  const physicalValid =
    physNumber.replace(/\D/g, "").length >= 4 && physExpiry.trim() !== "";

  // ── Template submit ────────────────────────────────────────────────────────
  function handleTemplateSubmit() {
    if (selectedTemplateIndex === null) return;
    const t = USE_CASE_TEMPLATES[selectedTemplateIndex];
    const resolvedParent = parentCardId || physicalCards[0]?.id;
    addCard({
      id: generateCardId(t.useCase as UseCase),
      type: "virtual",
      useCase: t.useCase,
      label: t.label,
      maskedNumber: generateMaskedNumber(),
      status: "active",
      limit: t.defaultLimit,
      spent: 0,
      mfaThreshold: Math.round(t.defaultLimit * 0.2),
      mfaEnabled: true,
      color: t.color,
      icon: t.icon,
      parentCardId: resolvedParent,
    });
    handleClose();
  }

  const templateValid =
    selectedTemplateIndex !== null && physicalCards.length > 0;

  // ── Custom submit ──────────────────────────────────────────────────────────
  function handleCustomSubmit() {
    const lim = Number(customLimit) || 200;
    const resolvedParent = parentCardId || physicalCards[0]?.id;
    addCard({
      id: generateCardId("custom" as UseCase),
      type: "virtual",
      useCase: "custom",
      label: customLabel || "Custom Card",
      maskedNumber: generateMaskedNumber(),
      status: "active",
      limit: lim,
      spent: 0,
      mfaThreshold: Math.round(lim * 0.2),
      mfaEnabled: true,
      color: customColor,
      icon: DEFAULT_TOKEN_ICON,
      parentCardId: resolvedParent,
    });
    handleClose();
  }

  const customValid =
    customLabel.trim() !== "" && Number(customLimit) > 0 && physicalCards.length > 0;

  // ── Mode pill styles ───────────────────────────────────────────────────────
  const pillBase =
    "text-sm px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer border";
  const pillActive = { backgroundColor: JUSPAY_ACCENT, color: "#fff", borderColor: JUSPAY_ACCENT };
  const pillInactive = { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#e5e7eb" };

  // ── Primary button ─────────────────────────────────────────────────────────
  const primaryBtn = (disabled: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity ${
      disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
    }`;

  // ── Input style ────────────────────────────────────────────────────────────
  const inputCls =
    "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <Modal open={open} onClose={handleClose} title="Add a card">
      {/* Mode switcher */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["physical", "custom", "template"] as Mode[]).map((m) => {
          const labels: Record<Mode, string> = {
            physical: "Card",
            custom: "Create Token",
            template: "Token Templates",
          };
          return (
            <button
              key={m}
              className={pillBase}
              style={mode === m ? pillActive : pillInactive}
              onClick={() => setMode(m)}
            >
              {labels[m]}
            </button>
          );
        })}
      </div>

      {/* ── PHYSICAL MODE ───────────────────────────────────────────────── */}
      {mode === "physical" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Card number
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="1234 5678 9012 3456"
              value={physNumber}
              maxLength={19}
              onChange={(e) => setPhysNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Expiry (MM/YY)
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="MM/YY"
                value={physExpiry}
                maxLength={5}
                onChange={(e) => setPhysExpiry(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cardholder name
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="Full name"
                value={physHolder}
                onChange={(e) => setPhysHolder(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Only the last 4 digits are stored — this is a mock entry.
          </p>

          <div className="flex justify-end mt-1">
            <button
              className={primaryBtn(!physicalValid)}
              style={{ backgroundColor: JUSPAY_ACCENT }}
              disabled={!physicalValid}
              onClick={handlePhysicalSubmit}
            >
              Add card
            </button>
          </div>
        </div>
      )}

      {/* ── TEMPLATE MODE ───────────────────────────────────────────────── */}
      {mode === "template" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Pick a use-case template to generate a token with preset
            icon, color, and limit.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {USE_CASE_TEMPLATES.map((t, i) => {
              const isSelected = selectedTemplateIndex === i;
              return (
                <button
                  key={t.useCase}
                  className="rounded-xl p-3 border-2 text-left transition-all hover:shadow-sm flex flex-col gap-2"
                  style={{
                    borderColor: isSelected ? t.color : "#e5e7eb",
                    backgroundColor: isSelected ? `${t.color}12` : "#fafafa",
                  }}
                  onClick={() => setSelectedTemplateIndex(i)}
                >
                  <div
                    className="rounded-lg p-2 w-fit"
                    style={{ backgroundColor: `${t.color}22` }}
                  >
                    <IconRenderer
                      name={t.icon}
                      size={20}
                      className="block"
                      // icon color via wrapper; IconRenderer doesn't accept color
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    Limit ${t.defaultLimit.toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Physical card selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Issued under (card)
            </label>
            {physicalCards.length === 0 ? (
              <p className="text-sm text-red-500 border border-red-200 rounded-lg px-3 py-2 bg-red-50">
                Add a card first before creating a token.
              </p>
            ) : (
              <select
                className={inputCls}
                value={parentCardId || physicalCards[0]?.id}
                onChange={(e) => setParentCardId(e.target.value)}
              >
                {physicalCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} — {c.maskedNumber}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end">
            <button
              className={primaryBtn(!templateValid)}
              style={{ backgroundColor: JUSPAY_ACCENT }}
              disabled={!templateValid}
              onClick={handleTemplateSubmit}
            >
              Generate card
            </button>
          </div>
        </div>
      )}

      {/* ── CUSTOM MODE ─────────────────────────────────────────────────── */}
      {mode === "custom" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Card label
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Gaming, Dining…"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Monthly limit ($)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="200"
              min={1}
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Card color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
              />
              <span className="text-sm text-gray-500 font-mono">
                {customColor}
              </span>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-xl p-3 flex items-center gap-3 border border-gray-200 bg-gray-50">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: customColor }}
            >
              <IconRenderer name={DEFAULT_TOKEN_ICON} size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {customLabel || "Custom Card"}
              </p>
              <p className="text-xs text-gray-500">
                Virtual · {customColor} · Limit ${Number(customLimit) || 200}
              </p>
            </div>
          </div>

          {/* Physical card selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Issued under (card)
            </label>
            {physicalCards.length === 0 ? (
              <p className="text-sm text-red-500 border border-red-200 rounded-lg px-3 py-2 bg-red-50">
                Add a card first before creating a token.
              </p>
            ) : (
              <select
                className={inputCls}
                value={parentCardId || physicalCards[0]?.id}
                onChange={(e) => setParentCardId(e.target.value)}
              >
                {physicalCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} — {c.maskedNumber}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end mt-1">
            <button
              className={primaryBtn(!customValid)}
              style={{ backgroundColor: JUSPAY_ACCENT }}
              disabled={!customValid}
              onClick={handleCustomSubmit}
            >
              Create card
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
