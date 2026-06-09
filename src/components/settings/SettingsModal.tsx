import React, { useState } from "react";
import { SettingsNav } from "./SettingsNav";
import { SettingsContent } from "./SettingsContent";

export function SettingsModal() {
  const [selected, setSelected] = useState("general");
  const [navOpen, setNavOpen] = useState(false);

  const handleSelect = (id: string) => {
    setSelected(id);
    setNavOpen(false); // close the mobile drawer after picking a section
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50">
      <div className="bg-white shadow-xl flex flex-col md:flex-row overflow-hidden rounded-2xl w-full md:w-[min(900px,calc(100vw-48px))] h-full md:h-auto md:min-h-[600px] max-h-full md:max-h-[calc(100vh-48px)]">
        <SettingsNav
          selected={selected}
          onSelect={handleSelect}
          open={navOpen}
          onClose={() => setNavOpen(false)}
        />
        <div className="hidden md:block md:w-px bg-gray-100 flex-shrink-0" />
        <SettingsContent selected={selected} onOpenNav={() => setNavOpen(true)} />
      </div>
    </div>
  );
}
