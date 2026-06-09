import React, { useState } from "react";
import { SettingsNav } from "./SettingsNav";
import { SettingsContent } from "./SettingsContent";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [selected, setSelected] = useState("general");
  const [navOpen, setNavOpen] = useState(false);

  if (!open) return null;

  const handleSelect = (id: string) => {
    setSelected(id);
    setNavOpen(false); // close the mobile drawer after picking a section
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 md:p-6 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-xl flex flex-col md:flex-row overflow-hidden rounded-2xl w-full md:w-[min(900px,calc(100vw-48px))] h-[82vh] md:h-auto md:min-h-[600px] max-h-[82vh] md:max-h-[calc(100vh-48px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <SettingsNav
          selected={selected}
          onSelect={handleSelect}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onCloseModal={onClose}
        />
        <div className="hidden md:block md:w-px bg-gray-100 flex-shrink-0" />
        <SettingsContent
          selected={selected}
          onOpenNav={() => setNavOpen(true)}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
