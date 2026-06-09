import type { UseCase } from "./types";

export interface UseCaseTemplate {
  useCase: UseCase;
  label: string;
  icon: string;
  color: string;
  defaultLimit: number;
}

export const USE_CASE_TEMPLATES: UseCaseTemplate[] = [
  { useCase: "groceries", label: "Groceries", icon: "ShoppingCart", color: "#16A34A", defaultLimit: 800 },
  { useCase: "saas",      label: "SaaS",      icon: "Cloud",        color: "#4F46E5", defaultLimit: 300 },
  { useCase: "travel",    label: "Travel",    icon: "Plane",        color: "#0EA5E9", defaultLimit: 2000 },
  { useCase: "shopping",  label: "Shopping",  icon: "ShoppingBag",  color: "#DB2777", defaultLimit: 1000 },
];

/**
 * Generate a stable-ish unique card ID for a given use case.
 * Uses Math.random — acceptable for client-side demo runtime.
 */
export function generateCardId(useCase: UseCase): string {
  return `card_${useCase}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a masked card number display string: "•••• XXXX"
 * Always 4 digits in the last group.
 */
export function generateMaskedNumber(): string {
  return `•••• ${Math.floor(1000 + Math.random() * 9000)}`;
}
