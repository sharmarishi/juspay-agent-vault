import type { VaultState } from "../data/types";
import { SEED } from "../data/seed";

export const STORAGE_KEY = "juspay-agent-vault";
export const SCHEMA_VERSION = 2;

/**
 * Maps every legacy seed appId to the canonical subagentId category.
 * Applied during migration so old persisted transactions resolve correctly.
 */
const APP_TO_SUBAGENT: Record<string, string> = {
  app_instacart: "sub_grocery",
  app_booking:   "sub_travel",
  app_expedia:   "sub_travel",
  app_spotify:   "sub_entertainment",
  app_notion:    "sub_saas",
  app_chatgpt:   "sub_shopping",
};

/**
 * Migrates a VaultState (potentially legacy shape) to the current schema version.
 *
 * V1 → V2 migrations:
 * - Each transaction with legacy `appId` and no `subagentId` gets
 *   `subagentId = APP_TO_SUBAGENT[appId] ?? "sub_shopping"` and `appId` key removed.
 *   Transactions that already have `subagentId` are left untouched (idempotent).
 * - Each card missing `subagentIds` gets `subagentIds: []`.
 * - If `state.subagents` is missing/empty, set it to the canonical SUBAGENTS list;
 *   drop any legacy `apps` key.
 *
 * V0/V1 migration (carried forward):
 * - Orphan virtual cards (missing `parentCardId`) get attached to the first physical card.
 * - If no physical card exists, orphan virtual cards are left as-is without throwing.
 *
 * Sets `schemaVersion = SCHEMA_VERSION` on every call.
 * Idempotent: calling migrate() multiple times produces the same result.
 */
export function migrate(state: VaultState): VaultState {
  // Work on a loosely-typed copy so we can read legacy fields (appId, apps) without tsc errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = state as any;

  // ── 1. Orphan-virtual-card migration (v0 → v1, kept idempotent) ────────────
  const firstPhysical = (s.cards as { id: string; type: string }[]).find(
    (c) => c.type === "physical"
  );
  const migratedCards = (s.cards as {
    type: string;
    parentCardId?: string;
    subagentIds?: string[];
    [key: string]: unknown;
  }[]).map((card) => {
    let result = { ...card };
    // Attach orphan virtual cards to first physical card
    if (result.type === "virtual" && !result.parentCardId && firstPhysical) {
      result = { ...result, parentCardId: firstPhysical.id };
    }
    // Default subagentIds to [] if missing
    if (!Array.isArray(result.subagentIds)) {
      result = { ...result, subagentIds: [] };
    }
    return result;
  });

  // ── 2. Transaction migration: appId → subagentId ──────────────────────────
  const migratedTransactions = (s.transactions as {
    subagentId?: string;
    appId?: string;
    [key: string]: unknown;
  }[]).map((txn) => {
    if (!txn.subagentId && txn.appId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = { ...txn };
      result.subagentId = APP_TO_SUBAGENT[txn.appId as string] ?? "sub_shopping";
      delete result.appId;
      return result;
    }
    return txn;
  });

  // ── 3. Subagents migration: use canonical list if missing/empty ────────────
  let subagents = s.subagents;
  if (!Array.isArray(subagents) || subagents.length === 0) {
    subagents = structuredClone(SEED.subagents);
  }

  // Build the result, drop legacy `apps` key
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {
    ...s,
    cards: migratedCards,
    transactions: migratedTransactions,
    subagents,
    schemaVersion: SCHEMA_VERSION,
  };
  delete result.apps;

  return result as VaultState;
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
