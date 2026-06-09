import React from "react";
import { X } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

interface SettingsNavProps {
  selected: string;
  onSelect: (id: string) => void;
  /** Close the whole settings modal (desktop X button) */
  onCloseModal: () => void;
}

export function SettingsNav({ selected, onSelect, onCloseModal }: SettingsNavProps) {
  const navList = (
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
            {item.tag && (
              <span className="ml-auto text-[10px] font-medium rounded-full px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100">
                {item.tag}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    /* Desktop sidebar only */
    <div className="hidden md:flex md:flex-col flex-shrink-0 md:overflow-y-auto md:py-4 md:w-[260px]">
      <div className="flex items-center px-3 mb-3">
        <button
          className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-100"
          aria-label="Close settings"
          onClick={onCloseModal}
        >
          <X size={18} />
        </button>
      </div>
      {navList}
    </div>
  );
}
