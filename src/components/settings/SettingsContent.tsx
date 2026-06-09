import React from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "./navItems";
import { GeneralSection } from "../../sections/GeneralSection";
import { PaymentsSection } from "../../sections/PaymentsSection";
import { ShoppingSection } from "../../sections/ShoppingSection";
import { PlaceholderSection } from "../../sections/PlaceholderSection";

interface SettingsContentProps {
  selected: string;
  /** Open the mobile nav drawer */
  onOpenNav: () => void;
  /** Close the whole settings modal (mobile X in header) */
  onClose: () => void;
}

export function SettingsContent({ selected, onOpenNav, onClose }: SettingsContentProps) {
  const activeItem = NAV_ITEMS.find((item) => item.id === selected);
  const title = activeItem ? activeItem.label : "Settings";

  function renderBody() {
    if (selected === "general") {
      return <GeneralSection />;
    }
    if (selected === "payments") {
      return <PaymentsSection />;
    }
    if (selected === "shopping") {
      return <ShoppingSection />;
    }
    return <PlaceholderSection label={title} />;
  }

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onOpenNav}
          aria-label="Open settings menu"
          className="md:hidden -ml-1 p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="md:hidden ml-auto p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      {renderBody()}
    </div>
  );
}
