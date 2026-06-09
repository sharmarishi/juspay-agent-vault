import React from "react";
import {
  SquarePen,
  Search,
  ChevronDown,
  Gift,
  PanelLeft,
  Plus,
  SlidersHorizontal,
  AudioLines,
  Settings,
  FolderClosed,
  Grid3x3,
  Code2,
  MoreHorizontal,
  BookOpen,
  Image,
  Pencil,
} from "lucide-react";

/**
 * Foreground ChatGPT-style landing page. This is the primary view — the settings
 * modal opens on top of it when the user clicks the Settings entry point.
 */
function OpenAILogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4067-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

interface LandingPageProps {
  onOpenSettings: () => void;
}

const RECENT_CHATS = [
  "Hotel booking in Mysore",
  "Payment setup prompt",
  "Pay bill assistance",
  "Fintech Terms Explained",
  "Initial greeting",
];

const NAV_ITEMS_STATIC = [
  { icon: SquarePen, label: "New chat", active: true },
  { icon: Search, label: "Search chats" },
  { icon: BookOpen, label: "Library" },
  { icon: FolderClosed, label: "Projects" },
  { icon: Grid3x3, label: "Apps" },
  { icon: Code2, label: "Codex" },
  { icon: MoreHorizontal, label: "More" },
];

const ACTION_CHIPS = [
  { icon: Image, label: "Create an image" },
  { icon: Pencil, label: "Write or edit" },
  { icon: Search, label: "Look something up" },
];

export function LandingPage({ onOpenSettings }: LandingPageProps) {
  return (
    <div className="fixed inset-0 flex bg-[#f9f9f9] text-gray-700 overflow-hidden">
      {/* Left Sidebar — desktop only */}
      <aside className="hidden sm:flex flex-col w-[260px] border-r border-gray-200/70 py-4 flex-shrink-0">
        {/* Sidebar top: logo + collapse icon */}
        <div className="flex items-center justify-between px-4 mb-3">
          <OpenAILogo className="w-7 h-7 text-gray-800" />
          <PanelLeft size={18} className="text-gray-400" />
        </div>

        {/* Settings entry point — the KEY interactive element */}
        <div className="px-2 mb-1">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Open settings"
          >
            <Settings size={16} className="flex-shrink-0 text-gray-600" />
            <span className="font-medium">Settings</span>
            <span className="ml-auto text-[10px] font-medium rounded-full px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100">
              Demo
            </span>
          </button>
        </div>

        {/* Primary nav */}
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV_ITEMS_STATIC.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm select-none cursor-default ${
                active ? "bg-gray-100 text-gray-800" : "text-gray-600"
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </nav>

        {/* Recents */}
        <div className="mt-4 px-4">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">
            Recents
          </p>
          <ul className="flex flex-col gap-0.5">
            {RECENT_CHATS.map((title) => (
              <li
                key={title}
                className="text-[13px] text-gray-600 px-1 py-1.5 rounded-md hover:bg-gray-100 cursor-default select-none truncate"
              >
                {title}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: user profile */}
        <div className="mt-auto px-4 pt-4 border-t border-gray-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-gray-800 truncate">Rishi Sharma</p>
            <p className="text-[11px] text-gray-400">Free</p>
          </div>
          <button className="text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5 whitespace-nowrap hover:bg-indigo-100 transition-colors">
            Claim offer
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            {/* Mobile: gear icon + Demo pill (settings entry) */}
            <button
              onClick={onOpenSettings}
              className="sm:hidden flex items-center gap-1.5 p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Open settings"
            >
              <Settings size={18} />
              <span className="text-[10px] font-medium rounded-full px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100">
                Demo
              </span>
            </button>
            <span className="flex items-center gap-1 text-[17px] font-medium text-gray-800">
              ChatGPT <ChevronDown size={16} className="text-gray-400" />
            </span>
          </div>
          <div className="flex items-center gap-4 text-indigo-500">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Gift size={16} /> Free offer
            </span>
            <div className="h-5 w-5 rounded-md border border-dashed border-gray-300" />
          </div>
        </header>

        {/* Center: heading + composer + action chips */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-medium text-gray-800 text-center">
            What's on your mind today?
          </h1>

          <div className="w-full max-w-[720px]">
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <Plus size={20} className="text-gray-400 shrink-0" />
              <span className="flex-1 text-[15px] text-gray-400 truncate">
                Ask anything
              </span>
              <SlidersHorizontal size={18} className="text-gray-400 shrink-0" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white shrink-0">
                <AudioLines size={16} />
              </div>
            </div>
          </div>

          {/* Action chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ACTION_CHIPS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 cursor-default select-none"
              >
                <Icon size={14} className="text-gray-400 flex-shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
