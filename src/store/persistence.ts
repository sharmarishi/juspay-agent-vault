import type { VaultState } from "../data/types";
import { SEED } from "../data/seed";

export const STORAGE_KEY = "juspay-agent-vault";
export const SCHEMA_VERSION = 1;

/**
 * Migrates a VaultState to the current schema version.
 * - Attaches orphan virtual cards (missing parentCardId) to the first physical card's id.
 * - If no physical card exists, orphan virtual cards are left as-is without throwing.
 * - Sets schemaVersion to SCHEMA_VERSION.
 * - Idempotent: already-parented virtual cards are left unchanged.
 */
export function migrate(state: VaultState): VaultState {
  const firstPhysical = state.cards.find((c) => c.type === "physical");
  const migratedCards = state.cards.map((card) => {
    if (card.type === "virtual" && !card.parentCardId && firstPhysical) {
      return { ...card, parentCardId: firstPhysical.id };
    }
    return card;
  });
  return { ...state, cards: migratedCards, schemaVersion: SCHEMA_VERSION };
}

/**
 * Loads VaultState from localStorage.
 * - If the key is missing, returns a deep clone of SEED (with migration applied).
 * - If the stored value is malformed JSON, returns a deep clone of SEED (with migration applied).
 * - Otherwise returns the parsed and migrated VaultState.
 */
export function loadState(): VaultState {
  if (typeof window === "undefined") {
    return migrate(structuredClone(SEED));
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return migrate(structuredClone(SEED));
  }
  try {
    const parsed = JSON.parse(raw) as VaultState;
    return migrate(parsed);
  } catch {
    return migrate(structuredClone(SEED));
  }
}

/**
 * Persists VaultState to localStorage.
 */
export function saveState(state: VaultState): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
