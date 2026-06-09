import React from "react";
import type { Card } from "../../data/types";
import { IconRenderer } from "./IconRenderer";
import { JUSPAY_NAME } from "../../theme/tokens";

interface CardVisualProps {
  card: Card;
  onClick?: () => void;
  className?: string;
}

export function CardVisual({ card, onClick, className }: CardVisualProps) {
  return (
    <div
      className={`relative rounded-2xl p-4 text-white shadow-sm overflow-hidden select-none ${onClick ? "cursor-pointer" : ""} ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`, aspectRatio: "1.6 / 1" }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {/* Top row: icon chip + card-type chip */}
      <div className="flex items-start justify-between">
        {/* Icon chip */}
        <div className="bg-white/20 rounded-lg p-1.5">
          <IconRenderer name={card.icon} size={20} className="text-white" />
        </div>

        {/* Card type chip */}
        <span className="text-[10px] uppercase tracking-wide bg-white/20 rounded-full px-2 py-0.5 font-medium">
          {card.type === "physical" ? "Physical" : "Virtual"}
        </span>
      </div>

      {/* Middle: label + masked number */}
      <div className="mt-3">
        <p className="text-sm font-semibold leading-tight">{card.label}</p>
        <p className="text-base font-mono tracking-widest mt-1">{card.maskedNumber}</p>
      </div>

      {/* Bottom row: status badge + Juspay mark */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        {/* Status badge */}
        {card.status === "active" ? (
          <span className="text-[10px] rounded-full px-2 py-0.5 bg-white/25 font-medium">
            Active
          </span>
        ) : (
          <span className="text-[10px] rounded-full px-2 py-0.5 bg-black/30 font-medium">
            Frozen
          </span>
        )}

        {/* Juspay mark */}
        <span className="text-[10px] font-semibold text-white/80">{JUSPAY_NAME}</span>
      </div>
    </div>
  );
}
