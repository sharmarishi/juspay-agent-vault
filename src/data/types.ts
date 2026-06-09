// Domain model for Juspay Agent Vault
// These types are the contract for all downstream phases.

export type CardType = "physical" | "virtual";
export type CardStatus = "active" | "frozen";
export type UseCase =
  | "groceries"
  | "saas"
  | "travel"
  | "shopping"
  | "general"
  | "custom";

export interface Card {
  id: string; // e.g. "card_groceries_01"
  type: CardType;
  useCase: UseCase;
  label: string; // e.g. "Groceries", "Netflix & SaaS"
  maskedNumber: string; // e.g. "•••• 4821"
  status: CardStatus; // active | frozen
  limit: number; // monthly spending limit in USD
  spent: number; // spent this period (for spend-vs-limit bar)
  mfaThreshold: number; // amount above which MFA is required
  mfaEnabled: boolean; // MFA enforcement on/off
  color: string; // hex used on the card visual
  icon: string; // lucide icon name (string) e.g. "ShoppingCart"
  holder?: string; // for physical cards
  expiry?: string; // "MM/YY" for physical cards
  parentCardId?: string; // virtual only — FK to a physical Card.id
  subagentIds: string[]; // which subagents may access this card (store + display only)
}

export interface Transaction {
  id: string;
  cardId: string; // FK -> Card.id
  subagentId: string; // FK -> Subagent.id (the use-case category, e.g. "sub_grocery")
  merchant: string; // display merchant name (specific vendor, e.g. "Safeway")
  amount: number; // USD
  date: string; // ISO date string
  status: "completed" | "pending" | "declined";
  isSubscription: boolean; // recurring subscription flag
}

export interface Subagent {
  id: string; // e.g. "sub_grocery"
  name: string; // "Grocery"
  icon: string; // lucide icon name
}

export interface VaultState {
  cards: Card[];
  transactions: Transaction[];
  subagents: Subagent[];
  schemaVersion?: number;
}
