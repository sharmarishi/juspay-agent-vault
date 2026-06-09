import React from "react";
import { X } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

interface SettingsNavProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function SettingsNav({ selected, onSelect }: SettingsNavProps) {
  return (
    <div
      className="flex flex-row md:flex-col flex-shrink-0 overflow-x-auto md:overflow-x-visible md:overflow-y-auto py-2 md:py-4 md:w-[260px]"
    >
      <div className="hidden md:flex items-center px-3 mb-3">
        <button
          className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-100"
          aria-label="Close settings"
          onClick={() => {}}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-row md:flex-col gap-0.5 px-2 md:px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === selected;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-800 flex-shrink-0 whitespace-nowrap md:w-full md:text-left transition-colors ${
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
