import {
  Settings,
  Bell,
  UserCircle,
  Grid3x3,
  CreditCard,
  ShoppingBag,
  Database,
  HardDrive,
  ShieldCheck,
  Users,
  Contact,
  User,
  Keyboard,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  tag?: string; // subtle badge, e.g. "Demo" — highlights the demo-relevant sections
}

export const NAV_ITEMS: NavItem[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "personalization", label: "Personalization", icon: UserCircle },
  { id: "apps", label: "Apps", icon: Grid3x3 },
  { id: "payments", label: "Payments", icon: CreditCard, tag: "Demo" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, tag: "Demo" },
  { id: "data-controls", label: "Data controls", icon: Database },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "parental-controls", label: "Parental controls", icon: Users },
  { id: "trusted-contact", label: "Trusted contact", icon: Contact },
  { id: "account", label: "Account", icon: User },
  { id: "keyboard", label: "Keyboard", icon: Keyboard },
];
