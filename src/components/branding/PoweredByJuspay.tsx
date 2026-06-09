import React from "react";
import juspayLogo from "../../assets/juspay-logo.png";
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
      <img src={juspayLogo} alt="Juspay logo" className="h-4 w-4 rounded-full" />
    </div>
  );
}
