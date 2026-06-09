import React, { useState } from "react";
import { SettingsNav } from "./SettingsNav";
import { SettingsContent } from "./SettingsContent";

export function SettingsModal() {
  const [selected, setSelected] = useState("general");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl shadow-xl flex overflow-hidden"
        style={{ width: "min(900px, calc(100vw - 48px))", minHeight: 600, maxHeight: "calc(100vh - 48px)" }}
      >
        <SettingsNav selected={selected} onSelect={setSelected} />
        <div className="w-px bg-gray-100 flex-shrink-0" />
        <SettingsContent selected={selected} />
      </div>
    </div>
  );
}
