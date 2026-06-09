import type { VaultState } from "../data/types";
import { SEED } from "../data/seed";

export const STORAGE_KEY = "juspay-agent-vault";

/**
 * Loads VaultState from localStorage.
 * - If the key is missing, returns a deep clone of SEED.
 * - If the stored value is malformed JSON, returns a deep clone of SEED.
 * - Otherwise returns the parsed VaultState.
 */
export function loadState(): VaultState {
  if (typeof window === "undefined") {
    return structuredClone(SEED);
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return structuredClone(SEED);
  }
  try {
    const parsed = JSON.parse(raw) as VaultState;
    return parsed;
  } catch {
    return structuredClone(SEED);
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
