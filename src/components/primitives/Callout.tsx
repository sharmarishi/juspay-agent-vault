import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface CalloutProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function Callout({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
}: CalloutProps) {
  return (
    <div className="relative bg-gray-50 rounded-xl p-5 mb-4">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
      <div className="flex flex-col gap-3">
        <div className="text-gray-700">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        <button
          onClick={onAction}
          className="self-start text-sm text-gray-700 border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-100 transition-colors"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
