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
    expect(Array.isArray(state.apps)).toBe(true);
    expect(state.cards.length).toBeGreaterThanOrEqual(5);
    expect(state.transactions.length).toBeGreaterThanOrEqual(10);
    expect(state.apps.length).toBeGreaterThanOrEqual(5);
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
});
