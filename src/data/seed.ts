import type { VaultState, Card, Transaction, ConnectedApp } from "./types";

// ---------------------------------------------------------------------------
// Connected Apps
// ---------------------------------------------------------------------------
const APPS: ConnectedApp[] = [
  { id: "app_instacart", name: "Instacart", icon: "ShoppingCart" },
  { id: "app_booking", name: "Booking.com", icon: "Hotel" },
  { id: "app_expedia", name: "Expedia", icon: "Plane" },
  { id: "app_spotify", name: "Spotify", icon: "Music" },
  { id: "app_notion", name: "Notion", icon: "FileText" },
  { id: "app_chatgpt", name: "ChatGPT", icon: "Bot" },
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
  },
];

// ---------------------------------------------------------------------------
// Transactions — >= 10, at least 2 isSubscription: true, realistic dates
// ---------------------------------------------------------------------------

// Helper: days ago from today
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

const TRANSACTIONS: Transaction[] = [
  // Subscription: Spotify on SaaS card (isSubscription: true)
  {
    id: "txn_001",
    cardId: "card_saas_01",
    appId: "app_spotify",
    merchant: "Spotify Premium",
    amount: 11.99,
    date: daysAgo(2),
    status: "completed",
    isSubscription: true,
  },

  // Subscription: Notion on SaaS card (isSubscription: true)
  {
    id: "txn_002",
    cardId: "card_saas_01",
    appId: "app_notion",
    merchant: "Notion Pro",
    amount: 16.0,
    date: daysAgo(5),
    status: "completed",
    isSubscription: true,
  },

  // Grocery purchase via Instacart
  {
    id: "txn_003",
    cardId: "card_groceries_01",
    appId: "app_instacart",
    merchant: "Instacart — Whole Foods",
    amount: 87.42,
    date: daysAgo(3),
    status: "completed",
    isSubscription: false,
  },

  // Grocery purchase via Instacart again
  {
    id: "txn_004",
    cardId: "card_groceries_01",
    appId: "app_instacart",
    merchant: "Instacart — Trader Joe's",
    amount: 56.18,
    date: daysAgo(14),
    status: "completed",
    isSubscription: false,
  },

  // Grocery pending
  {
    id: "txn_005",
    cardId: "card_groceries_01",
    appId: "app_instacart",
    merchant: "Instacart — Safeway",
    amount: 34.7,
    date: daysAgo(1),
    status: "pending",
    isSubscription: false,
  },

  // Shopping via ChatGPT
  {
    id: "txn_006",
    cardId: "card_shopping_01",
    appId: "app_chatgpt",
    merchant: "Amazon — Electronics",
    amount: 249.99,
    date: daysAgo(7),
    status: "completed",
    isSubscription: false,
  },

  // Shopping declined (exceeded MFA threshold without auth)
  {
    id: "txn_007",
    cardId: "card_shopping_01",
    appId: "app_chatgpt",
    merchant: "eBay — Vintage Camera",
    amount: 180.0,
    date: daysAgo(10),
    status: "declined",
    isSubscription: false,
  },

  // Physical card — restaurant
  {
    id: "txn_008",
    cardId: "card_physical_01",
    appId: "app_chatgpt",
    merchant: "Nobu Restaurant",
    amount: 320.0,
    date: daysAgo(6),
    status: "completed",
    isSubscription: false,
  },

  // Physical card — pharmacy
  {
    id: "txn_009",
    cardId: "card_physical_01",
    appId: "app_chatgpt",
    merchant: "CVS Pharmacy",
    amount: 42.15,
    date: daysAgo(20),
    status: "completed",
    isSubscription: false,
  },

  // Physical card — gas station
  {
    id: "txn_010",
    cardId: "card_physical_01",
    appId: "app_chatgpt",
    merchant: "Shell Gas Station",
    amount: 65.0,
    date: daysAgo(15),
    status: "completed",
    isSubscription: false,
  },

  // Entertainment via ChatGPT
  {
    id: "txn_011",
    cardId: "card_custom_01",
    appId: "app_chatgpt",
    merchant: "Netflix — Monthly",
    amount: 15.99,
    date: daysAgo(8),
    status: "completed",
    isSubscription: false,
  },

  // Entertainment - pending ticket
  {
    id: "txn_012",
    cardId: "card_custom_01",
    appId: "app_chatgpt",
    merchant: "Ticketmaster — Concert",
    amount: 39.99,
    date: daysAgo(2),
    status: "pending",
    isSubscription: false,
  },

  // Physical card — grocery (not via Instacart)
  {
    id: "txn_013",
    cardId: "card_physical_01",
    appId: "app_chatgpt",
    merchant: "Costco",
    amount: 235.0,
    date: daysAgo(30),
    status: "completed",
    isSubscription: false,
  },

  // SaaS — Figma (chatgpt agent)
  {
    id: "txn_014",
    cardId: "card_saas_01",
    appId: "app_chatgpt",
    merchant: "Figma Pro",
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
  apps: APPS,
  schemaVersion: 1,
};
