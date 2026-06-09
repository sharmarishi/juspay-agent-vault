import React, { useState } from "react";
import { SettingsNav } from "./SettingsNav";
import { SettingsContent } from "./SettingsContent";

export function SettingsModal() {
  const [selected, setSelected] = useState("general");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-stretch justify-stretch md:items-center md:justify-center z-50">
      <div
        className="bg-white shadow-xl flex flex-col md:flex-row overflow-hidden w-full h-full md:h-auto md:w-[min(900px,calc(100vw-48px))] md:min-h-[600px] md:max-h-[calc(100vh-48px)] md:rounded-2xl"
      >
        <SettingsNav selected={selected} onSelect={setSelected} />
        <div className="h-px w-full md:h-auto md:w-px bg-gray-100 flex-shrink-0" />
        <SettingsContent selected={selected} />
      </div>
    </div>
  );
}
