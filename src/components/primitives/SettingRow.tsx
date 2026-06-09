import React, { ReactNode } from "react";

interface SettingRowProps {
  label: string;
  sublabel?: string;
  control: ReactNode;
}

export function SettingRow({ label, sublabel, control }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {sublabel && (
          <span className="text-xs text-gray-500">{sublabel}</span>
        )}
      </div>
      <div className="flex-shrink-0 ml-4">{control}</div>
    </div>
  );
}
