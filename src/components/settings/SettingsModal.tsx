import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { SettingsNav } from "./SettingsNav";
import { SettingsContent } from "./SettingsContent";
import { NAV_ITEMS } from "./navItems";
import { GeneralSection } from "../../sections/GeneralSection";
import { PaymentsSection } from "../../sections/PaymentsSection";
import { ShoppingSection } from "../../sections/ShoppingSection";
import { PlaceholderSection } from "../../sections/PlaceholderSection";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

function renderSection(selected: string, title: string) {
  if (selected === "general") return <GeneralSection />;
  if (selected === "payments") return <PaymentsSection />;
  if (selected === "shopping") return <ShoppingSection />;
  return <PlaceholderSection label={title} />;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [selected, setSelected] = useState("general");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // Reset to list whenever settings (re)opens
  useEffect(() => {
    if (open) {
      setMobileView("list");
    }
  }, [open]);

  // Hooks must be declared before early return
  if (!open) return null;

  const activeItem = NAV_ITEMS.find((i) => i.id === selected);
  const title = activeItem?.label ?? "Settings";

  const handleSelect = (id: string) => {
    setSelected(id);
    setMobileView("detail");
  };

  return (
    <>
      {/* ── DESKTOP branch (md+): centered two-pane modal — UNCHANGED ── */}
      <div
        className="hidden md:flex fixed inset-0 bg-black/40 backdrop-blur-sm md:items-center md:justify-center md:p-6 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white shadow-xl flex md:flex-row overflow-hidden rounded-2xl md:w-[min(900px,calc(100vw-48px))] md:min-h-[600px] md:max-h-[calc(100vh-48px)]"
          onClick={(e) => e.stopPropagation()}
        >
          <SettingsNav
            selected={selected}
            onSelect={handleSelect}
            onCloseModal={onClose}
          />
          <div className="md:w-px bg-gray-100 flex-shrink-0" />
          <SettingsContent selected={selected} />
        </div>
      </div>

      {/* ── MOBILE branch (<md): full-screen master-detail ── */}
      <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">
        {mobileView === "list" ? (
          <>
            {/* List header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
              <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
              <button
                onClick={onClose}
                aria-label="Close settings"
                className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* List body — scrollable rows */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <Icon size={20} className="text-gray-700 shrink-0" />
                    <span className="text-sm text-gray-900">{item.label}</span>
                    {item.tag && (
                      <span className="ml-2 text-[10px] font-medium rounded-full px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {item.tag}
                      </span>
                    )}
                    <ChevronRight size={18} className="ml-auto text-gray-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Detail header */}
            <div className="flex items-center gap-2 px-2 h-14 border-b border-gray-100 shrink-0">
              <button
                onClick={() => setMobileView("list")}
                aria-label="Back"
                className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
              <button
                onClick={onClose}
                aria-label="Close settings"
                className="ml-auto p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Detail body — flex column so ShoppingSection's flex-1 fill works */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col">
              {renderSection(selected, title)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
