import React from "react";
import { JUSPAY_ACCENT, JUSPAY_NAME } from "../../theme/tokens";

export function PoweredByJuspay() {
  return (
    <div className="flex items-center gap-1.5 mt-6">
      <span className="text-xs text-gray-400">Powered by</span>
      <span
        className="text-xs font-semibold"
        style={{ color: JUSPAY_ACCENT }}
      >
        {JUSPAY_NAME}
      </span>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: JUSPAY_ACCENT }}
      />
    </div>
  );
}
