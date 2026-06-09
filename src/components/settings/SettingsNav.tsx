import React from "react";
import { X } from "lucide-react";
import { NAV_ITEMS } from "./navItems";
import { NAV_WIDTH } from "../../theme/tokens";

interface SettingsNavProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function SettingsNav({ selected, onSelect }: SettingsNavProps) {
  return (
    <div
      className="flex flex-col flex-shrink-0 py-4 overflow-y-auto"
      style={{ width: NAV_WIDTH }}
    >
      <div className="flex items-center px-3 mb-3">
        <button
          className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-100"
          aria-label="Close settings"
          onClick={() => {}}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === selected;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-800 w-full text-left transition-colors ${
                isActive ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <Icon size={18} className="flex-shrink-0 text-gray-700" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
