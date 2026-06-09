import React from "react";

interface PlaceholderSectionProps {
  label: string;
}

export function PlaceholderSection({ label }: PlaceholderSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-sm text-gray-500">
        Settings for this section are not part of this demo.
      </p>
    </div>
  );
}
