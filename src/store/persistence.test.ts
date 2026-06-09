import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// localStorage mock that works regardless of environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

const STORAGE_KEY = "juspay-agent-vault";

describe("persistence layer", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset module cache so loadState re-reads from localStorage each test
    vi.resetModules();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it("loadState returns deep clone of SEED when localStorage is empty", async () => {
    const { loadState, STORAGE_KEY: KEY } = await import("./persistence");
    expect(KEY).toBe(STORAGE_KEY);
    const state = loadState();
    expect(state).toBeDefined();
    expect(Array.isArray(state.cards)).toBe(true);
    expect(Array.isArray(state.transactions)).toBe(true);
    expect(Array.isArray(state.subagents)).toBe(true);
    expect(state.cards.length).toBeGreaterThanOrEqual(5);
    expect(state.transactions.length).toBeGreaterThanOrEqual(10);
    // 6 canonical subagents
    expect(state.subagents.length).toBeGreaterThanOrEqual(5);
  });

  it("loadState returns a deep clone (not the original SEED reference)", async () => {
    const { loadState } = await import("./persistence");
    const s1 = loadState();
    const s2 = loadState();
    expect(s1).not.toBe(s2); // different references
    expect(s1.cards).not.toBe(s2.cards);
  });

  it("loadState returns parsed VaultState from localStorage when present and valid", async () => {
    const { loadState, saveState } = await import("./persistence");
    const initial = loadState();
    // Modify and save
    const modified = {
      ...initial,
      cards: [
        ...initial.cards,
        {
          ...initial.cards[0],
          id: "card_test_99",
          label: "Test Card",
          maskedNumber: "•••• 9999",
        },
      ],
    };
    saveState(modified);
    // Now loadState should return the saved state
    const loaded = loadState();
    expect(loaded.cards.some((c) => c.id === "card_test_99")).toBe(true);
  });

  it("loadState returns SEED clone when localStorage value is malformed JSON", async () => {
    localStorageMock.setItem(STORAGE_KEY, "{ not valid json }}}");
    const { loadState } = await import("./persistence");
    const state = loadState();
    // Should silently recover and return seed
    expect(state).toBeDefined();
    expect(Array.isArray(state.cards)).toBe(true);
    expect(state.cards.length).toBeGreaterThanOrEqual(5);
  });

  it("saveState persists to localStorage so a subsequent loadState returns it", async () => {
    const { loadState, saveState } = await import("./persistence");
    const seed = loadState();
    // mutate and save
    const patched = {
      ...seed,
      cards: seed.cards.map((c, i) =>
        i === 0 ? { ...c, label: "PATCHED_LABEL" } : c
      ),
    };
    saveState(patched);
    const loaded = loadState();
    expect(loaded.cards[0].label).toBe("PATCHED_LABEL");
  });

  // ── Migration tests ─────────────────────────────────────────────────────────

  it("migration: orphan virtual cards get parentCardId attached to first physical card", async () => {
    // Save a state where virtual cards have no parentCardId
    const orphanState = {
      schemaVersion: 0,
      cards: [
        {
          id: "card_physical_01",
          type: "physical",
          useCase: "general",
          label: "Personal",
          maskedNumber: "•••• 4821",
          status: "active",
          limit: 5000,
          spent: 0,
          mfaThreshold: 200,
          mfaEnabled: true,
          color: "#1a1a2e",
          icon: "CreditCard",
        },
        {
          id: "card_virtual_01",
          type: "virtual",
          useCase: "groceries",
          label: "Groceries",
          maskedNumber: "•••• 3172",
          status: "active",
          limit: 600,
          spent: 0,
          mfaThreshold: 100,
          mfaEnabled: true,
          color: "#16a34a",
          icon: "ShoppingCart",
          // NO parentCardId
        },
      ],
      transactions: [],
      subagents: [],
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(orphanState));
    const { loadState } = await import("./persistence");
    const loaded = loadState();
    const virtualCard = loaded.cards.find((c) => c.id === "card_virtual_01");
    expect(virtualCard).toBeDefined();
    expect(virtualCard?.parentCardId).toBe("card_physical_01");
  });

  it("migration: already-parented virtual card keeps its parentCardId unchanged", async () => {
    const alreadyParentedState = {
      schemaVersion: 1,
      cards: [
        {
          id: "card_physical_01",
          type: "physical",
          useCase: "general",
          label: "Personal",
          maskedNumber: "•••• 4821",
          status: "active",
          limit: 5000,
          spent: 0,
          mfaThreshold: 200,
          mfaEnabled: true,
          color: "#1a1a2e",
          icon: "CreditCard",
        },
        {
          id: "card_virtual_01",
          type: "virtual",
          useCase: "groceries",
          label: "Groceries",
          maskedNumber: "•••• 3172",
          status: "active",
          limit: 600,
          spent: 0,
          mfaThreshold: 100,
          mfaEnabled: true,
          color: "#16a34a",
          icon: "ShoppingCart",
          parentCardId: "card_physical_01",
        },
      ],
      transactions: [],
      subagents: [],
    };
    localStorageMock.setItem(
      STORAGE_KEY,
      JSON.stringify(alreadyParentedState)
    );
    const { loadState } = await import("./persistence");
    const loaded = loadState();
    const virtualCard = loaded.cards.find((c) => c.id === "card_virtual_01");
    expect(virtualCard?.parentCardId).toBe("card_physical_01");
  });

  it("migration: SEED virtual cards all have parentCardId = card_physical_01", async () => {
    const { loadState } = await import("./persistence");
    const state = loadState(); // no localStorage = returns migrated SEED
    const virtualCards = state.cards.filter((c) => c.type === "virtual");
    expect(virtualCards.length).toBeGreaterThan(0);
    for (const card of virtualCards) {
      expect(card.parentCardId).toBe("card_physical_01");
    }
  });

  it("migration: orphan virtual cards without any physical card remain parentCardId-less without throwing", async () => {
    const noPhysicalState = {
      schemaVersion: 0,
      cards: [
        {
          id: "card_virtual_only",
          type: "virtual",
          useCase: "custom",
          label: "Lonely Virtual",
          maskedNumber: "•••• 9999",
          status: "active",
          limit: 100,
          spent: 0,
          mfaThreshold: 50,
          mfaEnabled: false,
          color: "#ff0000",
          icon: "Sparkles",
          // NO parentCardId, NO physical card
        },
      ],
      transactions: [],
      subagents: [],
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(noPhysicalState));
    const { loadState } = await import("./persistence");
    let loaded: ReturnType<typeof loadState> | undefined;
    expect(() => {
      loaded = loadState();
    }).not.toThrow();
    const virtualCard = loaded?.cards[0];
    expect(virtualCard?.parentCardId).toBeUndefined();
  });

  // ── New v2 migration tests ───────────────────────────────────────────────────

  it("migration: legacy appId transaction gets mapped subagentId and appId removed", async () => {
    const v1State = {
      schemaVersion: 1,
      cards: [
        {
          id: "card_physical_01",
          type: "physical",
          useCase: "general",
          label: "Personal",
          maskedNumber: "•••• 4821",
          status: "active",
          limit: 5000,
          spent: 0,
          mfaThreshold: 200,
          mfaEnabled: true,
          color: "#1a1a2e",
          icon: "CreditCard",
        },
      ],
      transactions: [
        {
          id: "txn_legacy_01",
          cardId: "card_physical_01",
          appId: "app_instacart",
          merchant: "Instacart — Safeway",
          amount: 45.0,
          date: "2026-06-01",
          status: "completed",
          isSubscription: false,
        },
      ],
      apps: [{ id: "app_instacart", name: "Instacart", icon: "ShoppingCart" }],
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(v1State));
    const { loadState } = await import("./persistence");
    const loaded = loadState();
    const txn = loaded.transactions.find((t) => t.id === "txn_legacy_01");
    expect(txn).toBeDefined();
    expect(txn?.subagentId).toBe("sub_grocery");
    // appId should be removed
    expect((txn as { appId?: string })?.appId).toBeUndefined();
    // merchant is preserved
    expect(txn?.merchant).toBe("Instacart — Safeway");
  });

  it("migration: card without subagentIds gets subagentIds: []", async () => {
    const v1State = {
      schemaVersion: 1,
      cards: [
        {
          id: "card_physical_01",
          type: "physical",
          useCase: "general",
          label: "Personal",
          maskedNumber: "•••• 4821",
          status: "active",
          limit: 5000,
          spent: 0,
          mfaThreshold: 200,
          mfaEnabled: true,
          color: "#1a1a2e",
          icon: "CreditCard",
          // NO subagentIds
        },
      ],
      transactions: [],
      subagents: [],
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(v1State));
    const { loadState } = await import("./persistence");
    const loaded = loadState();
    const card = loaded.cards.find((c) => c.id === "card_physical_01");
    expect(card).toBeDefined();
    expect(card?.subagentIds).toEqual([]);
  });

  it("migration: SEED cards all have subagentIds array", async () => {
    const { loadState } = await import("./persistence");
    const state = loadState();
    for (const card of state.cards) {
      expect(Array.isArray(card.subagentIds)).toBe(true);
    }
  });

  it("migration: SEED transactions all have subagentId + merchant", async () => {
    const { loadState } = await import("./persistence");
    const state = loadState();
    for (const txn of state.transactions) {
      expect(typeof txn.subagentId).toBe("string");
      expect(txn.subagentId.length).toBeGreaterThan(0);
      expect(typeof txn.merchant).toBe("string");
      expect(txn.merchant.length).toBeGreaterThan(0);
    }
  });

  it("migration: legacy apps state gets replaced with canonical SUBAGENTS list", async () => {
    const v1State = {
      schemaVersion: 1,
      cards: [],
      transactions: [],
      apps: [{ id: "app_instacart", name: "Instacart", icon: "ShoppingCart" }],
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(v1State));
    const { loadState } = await import("./persistence");
    const loaded = loadState();
    // subagents should be the canonical list (6 categories), not the old apps
    expect(Array.isArray(loaded.subagents)).toBe(true);
    expect(loaded.subagents.length).toBeGreaterThanOrEqual(5);
    // Old apps key should not exist on the result
    expect((loaded as { apps?: unknown }).apps).toBeUndefined();
  });

  it("migration: unknown appId gets fallback subagentId sub_shopping", async () => {
    const v1State = {
      schemaVersion: 1,
      cards: [],
      transactions: [
        {
          id: "txn_unknown",
          cardId: "card_physical_01",
          appId: "app_unknown_xyz",
          merchant: "Mystery Store",
          amount: 10.0,
          date: "2026-06-01",
          status: "completed",
          isSubscription: false,
        },
      ],
      apps: [],
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(v1State));
    const { loadState } = await import("./persistence");
    const loaded = loadState();
    const txn = loaded.transactions.find((t) => t.id === "txn_unknown");
    expect(txn?.subagentId).toBe("sub_shopping");
  });
});
