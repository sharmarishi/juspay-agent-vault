import React from "react";
import * as Icons from "lucide-react";

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
}

export function IconRenderer({ name, size, className }: IconRendererProps) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name] ?? Icons.CreditCard;
  return <Cmp size={size ?? 18} className={className} />;
}
