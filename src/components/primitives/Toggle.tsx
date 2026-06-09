import React from "react";
import { JUSPAY_ACCENT } from "../../theme/tokens";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
        checked ? "" : "bg-gray-300"
      }`}
      style={checked ? { backgroundColor: JUSPAY_ACCENT } : undefined}
    >
      <span
        className={`inline-block size-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
