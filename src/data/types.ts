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
}

export interface Transaction {
  id: string;
  cardId: string; // FK -> Card.id
  appId: string; // FK -> ConnectedApp.id (the initiating ChatGPT app/merchant)
  merchant: string; // display merchant name
  amount: number; // USD
  date: string; // ISO date string
  status: "completed" | "pending" | "declined";
  isSubscription: boolean; // recurring subscription flag
}

export interface ConnectedApp {
  id: string; // e.g. "app_instacart"
  name: string; // "Instacart"
  icon: string; // lucide icon name or emoji
}

export interface VaultState {
  cards: Card[];
  transactions: Transaction[];
  apps: ConnectedApp[];
  schemaVersion?: number;
}
