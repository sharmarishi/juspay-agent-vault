import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClass?: string;
}

export function Modal({ open, onClose, title, children, widthClass }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-stretch justify-stretch md:items-center md:justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className={`bg-white shadow-xl overflow-y-auto p-4 md:p-6 w-full h-full md:h-auto md:rounded-2xl md:max-h-[calc(100vh-48px)] ${widthClass ?? "md:w-[min(520px,calc(100vw-48px))]"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
