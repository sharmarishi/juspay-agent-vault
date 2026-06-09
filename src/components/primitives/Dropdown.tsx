import React from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  value: string;
}

export function Dropdown({ value }: DropdownProps) {
  return (
    <button className="flex items-center gap-1 px-2 py-1 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors">
      <span>{value}</span>
      <ChevronDown size={16} className="text-gray-500" />
    </button>
  );
}
