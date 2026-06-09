import React from "react";
import { X } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

interface SettingsNavProps {
  selected: string;
  onSelect: (id: string) => void;
  /** Mobile drawer open state */
  open: boolean;
  /** Close the mobile drawer */
  onClose: () => void;
}

export function SettingsNav({ selected, onSelect, open, onClose }: SettingsNavProps) {
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
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col flex-shrink-0 md:overflow-y-auto md:py-4 md:w-[260px]">
        <div className="flex items-center px-3 mb-3">
          <button
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close settings"
            onClick={() => {}}
          >
            <X size={18} />
          </button>
        </div>
        {navList}
      </div>

      {/* Mobile drawer (always mounted so it can slide in/out) */}
      <div
        className={`md:hidden fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Scrim */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        {/* Sliding panel */}
        <div
          className={`absolute left-0 top-0 h-full w-[260px] max-w-[80%] bg-white shadow-xl py-4 flex flex-col overflow-y-auto transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 mb-3">
            <span className="text-sm font-semibold text-gray-700">Settings</span>
            <button
              className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
          {navList}
        </div>
      </div>
    </>
  );
}
