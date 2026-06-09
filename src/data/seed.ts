import type { VaultState, Card, Transaction, Subagent } from "./types";

// ---------------------------------------------------------------------------
// Subagents — use-case CATEGORIES (not specific vendors)
// ---------------------------------------------------------------------------
export const SUBAGENTS: Subagent[] = [
  { id: "sub_shopping",      name: "Shopping",      icon: "ShoppingBag" },
  { id: "sub_grocery",       name: "Grocery",       icon: "ShoppingCart" },
  { id: "sub_gaming",        name: "Gaming",        icon: "Gamepad2" },
  { id: "sub_saas",          name: "SaaS",          icon: "Code2" },
  { id: "sub_travel",        name: "Travel",        icon: "Plane" },
  { id: "sub_entertainment", name: "Entertainment", icon: "Tv2" },
];

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
const CARDS: Card[] = [
  // Physical card — Rishi Sharma's primary card
  {
    id: "card_physical_01",
    type: "physical",
    useCase: "general",
    label: "Personal",
    maskedNumber: "•••• 4821",
    status: "active",
    limit: 5000,
    spent: 1240.5,
    mfaThreshold: 200,
    mfaEnabled: true,
    color: "#1a1a2e",
    icon: "CreditCard",
    holder: "Rishi Sharma",
    expiry: "09/27",
    subagentIds: [],
  },

  // Virtual — Groceries
  {
    id: "card_groceries_01",
    type: "virtual",
    useCase: "groceries",
    label: "Groceries",
    maskedNumber: "•••• 3172",
    status: "active",
    limit: 600,
    spent: 178.3,
    mfaThreshold: 100,
    mfaEnabled: true,
    color: "#16a34a",
    icon: "ShoppingCart",
    parentCardId: "card_physical_01",
    subagentIds: [],
  },

  // Virtual — SaaS
  {
    id: "card_saas_01",
    type: "virtual",
    useCase: "saas",
    label: "SaaS & Subscriptions",
    maskedNumber: "•••• 8834",
    status: "active",
    limit: 300,
    spent: 142.0,
    mfaThreshold: 50,
    mfaEnabled: false,
    color: "#7c3aed",
    icon: "Code2",
    parentCardId: "card_physical_01",
    subagentIds: [],
  },

  // Virtual — Travel (frozen)
  {
    id: "card_travel_01",
    type: "virtual",
    useCase: "travel",
    label: "Travel",
    maskedNumber: "•••• 5590",
    status: "frozen",
    limit: 2000,
    spent: 0,
    mfaThreshold: 300,
    mfaEnabled: true,
    color: "#0369a1",
    icon: "Plane",
    parentCardId: "card_physical_01",
    subagentIds: [],
  },

  // Virtual — Shopping
  {
    id: "card_shopping_01",
    type: "virtual",
    useCase: "shopping",
    label: "Online Shopping",
    maskedNumber: "•••• 2247",
    status: "active",
    limit: 800,
    spent: 320.75,
    mfaThreshold: 150,
    mfaEnabled: true,
    color: "#ea580c",
    icon: "Package",
    parentCardId: "card_physical_01",
    subagentIds: [],
  },

  // Virtual — Custom (extra card for variety)
  {
    id: "card_custom_01",
    type: "virtual",
    useCase: "custom",
    label: "Entertainment",
    maskedNumber: "•••• 9061",
    status: "active",
    limit: 200,
    spent: 55.98,
    mfaThreshold: 80,
    mfaEnabled: false,
    color: "#db2777",
    icon: "Tv2",
    parentCardId: "card_physical_01",
    subagentIds: [],
  },
];

// ---------------------------------------------------------------------------
// Transactions — 14 txns, each with distinct merchant + subagentId category
// ---------------------------------------------------------------------------

// Helper: days ago from today
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

const TRANSACTIONS: Transaction[] = [
  // Subscription: Spotify on SaaS card (isSubscription: true) — Entertainment
  {
    id: "txn_001",
    cardId: "card_saas_01",
    subagentId: "sub_entertainment",
    merchant: "Spotify",
    amount: 11.99,
    date: daysAgo(2),
    status: "completed",
    isSubscription: true,
  },

  // Subscription: Notion on SaaS card (isSubscription: true) — SaaS
  {
    id: "txn_002",
    cardId: "card_saas_01",
    subagentId: "sub_saas",
    merchant: "Notion",
    amount: 16.0,
    date: daysAgo(5),
    status: "completed",
    isSubscription: true,
  },

  // Grocery purchase via Instacart — Grocery
  {
    id: "txn_003",
    cardId: "card_groceries_01",
    subagentId: "sub_grocery",
    merchant: "Whole Foods",
    amount: 87.42,
    date: daysAgo(3),
    status: "completed",
    isSubscription: false,
  },

  // Grocery purchase — Safeway
  {
    id: "txn_004",
    cardId: "card_groceries_01",
    subagentId: "sub_grocery",
    merchant: "Safeway",
    amount: 56.18,
    date: daysAgo(14),
    status: "completed",
    isSubscription: false,
  },

  // Grocery pending — Instacart
  {
    id: "txn_005",
    cardId: "card_groceries_01",
    subagentId: "sub_grocery",
    merchant: "Instacart",
    amount: 34.7,
    date: daysAgo(1),
    status: "pending",
    isSubscription: false,
  },

  // Shopping — Amazon
  {
    id: "txn_006",
    cardId: "card_shopping_01",
    subagentId: "sub_shopping",
    merchant: "Amazon",
    amount: 249.99,
    date: daysAgo(7),
    status: "completed",
    isSubscription: false,
  },

  // Shopping declined — Best Buy
  {
    id: "txn_007",
    cardId: "card_shopping_01",
    subagentId: "sub_shopping",
    merchant: "Best Buy",
    amount: 180.0,
    date: daysAgo(10),
    status: "declined",
    isSubscription: false,
  },

  // Physical card — Travel (Booking.com)
  {
    id: "txn_008",
    cardId: "card_physical_01",
    subagentId: "sub_travel",
    merchant: "Booking.com",
    amount: 320.0,
    date: daysAgo(6),
    status: "completed",
    isSubscription: false,
  },

  // Physical card — Travel (Expedia)
  {
    id: "txn_009",
    cardId: "card_physical_01",
    subagentId: "sub_travel",
    merchant: "Expedia",
    amount: 420.0,
    date: daysAgo(20),
    status: "completed",
    isSubscription: false,
  },

  // Physical card — Shopping (Amazon)
  {
    id: "txn_010",
    cardId: "card_physical_01",
    subagentId: "sub_shopping",
    merchant: "Amazon",
    amount: 65.0,
    date: daysAgo(15),
    status: "completed",
    isSubscription: false,
  },

  // Entertainment — Netflix
  {
    id: "txn_011",
    cardId: "card_custom_01",
    subagentId: "sub_entertainment",
    merchant: "Netflix",
    amount: 15.99,
    date: daysAgo(8),
    status: "completed",
    isSubscription: false,
  },

  // Entertainment - Ticketmaster (pending)
  {
    id: "txn_012",
    cardId: "card_custom_01",
    subagentId: "sub_entertainment",
    merchant: "Ticketmaster",
    amount: 39.99,
    date: daysAgo(2),
    status: "pending",
    isSubscription: false,
  },

  // Gaming — Steam
  {
    id: "txn_013",
    cardId: "card_physical_01",
    subagentId: "sub_gaming",
    merchant: "Steam",
    amount: 59.99,
    date: daysAgo(30),
    status: "completed",
    isSubscription: false,
  },

  // SaaS — Figma
  {
    id: "txn_014",
    cardId: "card_saas_01",
    subagentId: "sub_saas",
    merchant: "Figma",
    amount: 15.0,
    date: daysAgo(12),
    status: "completed",
    isSubscription: false,
  },
];

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const SEED: VaultState = {
  cards: CARDS,
  transactions: TRANSACTIONS,
  subagents: SUBAGENTS,
  schemaVersion: 2,
};
