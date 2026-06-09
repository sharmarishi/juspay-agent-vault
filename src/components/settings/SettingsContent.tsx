import React from "react";
import { NAV_ITEMS } from "./navItems";
import { GeneralSection } from "../../sections/GeneralSection";
import { PaymentsSection } from "../../sections/PaymentsSection";
import { PlaceholderSection } from "../../sections/PlaceholderSection";

interface SettingsContentProps {
  selected: string;
}

export function SettingsContent({ selected }: SettingsContentProps) {
  const activeItem = NAV_ITEMS.find((item) => item.id === selected);
  const title = activeItem ? activeItem.label : "Settings";

  function renderBody() {
    if (selected === "general") {
      return <GeneralSection />;
    }
    if (selected === "payments") {
      return <PaymentsSection />;
    }
    return <PlaceholderSection label={title} />;
  }

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 overflow-y-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{title}</h1>
      {renderBody()}
    </div>
  );
}
