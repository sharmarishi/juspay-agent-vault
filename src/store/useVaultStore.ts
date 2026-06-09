import { create } from "zustand";
import type { Card, Transaction, VaultState } from "../data/types";
import { SEED } from "../data/seed";
import { loadState, saveState } from "./persistence";

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------
interface VaultStore extends VaultState {
  // Actions
  updateCard: (id: string, partial: Partial<Card>) => void;
  addCard: (card: Card) => void;
  removeCard: (id: string) => void;
  addTransaction: (txn: Transaction) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Helper: extract a VaultState snapshot from the store's current get()
// ---------------------------------------------------------------------------
function snapshot(
  get: () => Pick<VaultStore, "cards" | "transactions" | "apps">
): VaultState {
  const { cards, transactions, apps } = get();
  return { cards, transactions, apps };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useVaultStore = create<VaultStore>()((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  ...loadState(),

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Patch a card by id. Non-matching cards are unchanged.
   */
  updateCard(id: string, partial: Partial<Card>) {
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    }));
    saveState(snapshot(get));
  },

  /**
   * Append a new card to the list.
   */
  addCard(card: Card) {
    set((state) => ({ cards: [...state.cards, card] }));
    saveState(snapshot(get));
  },

  /**
   * Remove a card and all its associated transactions.
   */
  removeCard(id: string) {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      transactions: state.transactions.filter((t) => t.cardId !== id),
    }));
    saveState(snapshot(get));
  },

  /**
   * Append a new transaction.
   */
  addTransaction(txn: Transaction) {
    set((state) => ({ transactions: [...state.transactions, txn] }));
    saveState(snapshot(get));
  },

  /**
   * Reset state to the original seeded data and persist the reset.
   * DATA-03: this action is surfaced in the UI in plan 01-03.
   */
  reset() {
    const fresh = structuredClone(SEED);
    set(fresh);
    saveState(fresh);
  },
}));
