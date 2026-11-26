// RumahKas data — the sample household the planner is built around: the
// Hartonos, two adults and two children in Jakarta, November 2026.
// Every amount is in Indonesian rupiah. The planner, tracker and goals
// pages let the visitor change all of it; edits stay in the browser only
// (localStorage — see store.js).

export const META = {
  name: 'RumahKas',
  tagline: 'A household budget planner that shows where every rupiah goes.',
  household: 'The Hartono family · Jakarta · 2 adults, 2 children',
  month: 'November 2026',
  updated: 'November 2026',
};

export const CATEGORIES = [
  { key: 'housing', label: 'Housing & rent', kind: 'needs', colour: '#0f766e' },
  { key: 'food', label: 'Food & groceries', kind: 'needs', colour: '#2563eb' },
  { key: 'transport', label: 'Transport', kind: 'needs', colour: '#7c3aed' },
  { key: 'utilities', label: 'Utilities & bills', kind: 'needs', colour: '#0891b2' },
  { key: 'education', label: 'Education', kind: 'needs', colour: '#059669' },
  { key: 'health', label: 'Health', kind: 'needs', colour: '#dc2626' },
  { key: 'leisure', label: 'Leisure & fun', kind: 'wants', colour: '#d97706' },
  { key: 'clothing', label: 'Clothing & personal', kind: 'wants', colour: '#db2777' },
  { key: 'misc', label: 'Miscellaneous', kind: 'wants', colour: '#65a30d' },
  { key: 'savings', label: 'Savings & investing', kind: 'savings', colour: '#ea580c' },
];

// The month's budget, one row per category: the plan against what happened.
export const BUDGET = [
  { cat: 'housing', planned: 3500000, spent: 3500000 },
  { cat: 'food', planned: 2800000, spent: 2965000 },
  { cat: 'transport', planned: 1200000, spent: 1140000 },
  { cat: 'utilities', planned: 650000, spent: 712000 },
  { cat: 'education', planned: 1000000, spent: 1000000 },
  { cat: 'health', planned: 400000, spent: 285000 },
  { cat: 'leisure', planned: 600000, spent: 845000 },
  { cat: 'clothing', planned: 350000, spent: 420000 },
  { cat: 'misc', planned: 500000, spent: 380000 },
  { cat: 'savings', planned: 1500000, spent: 1500000 },
];

export const INCOME = { salary: 11000000, side: 1500000 };

// November's transactions, newest first.
export const TRANSACTIONS = [
  { on: '2026-11-24', what: 'Weekly groceries — Super Indo', cat: 'food', rp: 486000 },
  { on: '2026-11-23', what: 'Electricity token (PLN)', cat: 'utilities', rp: 312000 },
  { on: '2026-11-22', what: 'Cinema + popcorn (family)', cat: 'leisure', rp: 285000 },
  { on: '2026-11-21', what: 'Petrol — Pertalite', cat: 'transport', rp: 200000 },
  { on: '2026-11-20', what: 'School books & supplies', cat: 'education', rp: 340000 },
  { on: '2026-11-19', what: 'Dinner out — warteg + sate', cat: 'food', rp: 164000 },
  { on: '2026-11-18', what: 'Internet (Indihome)', cat: 'utilities', rp: 400000 },
  { on: '2026-11-17', what: 'New school shoes', cat: 'clothing', rp: 275000 },
  { on: '2026-11-15', what: 'Weekly groceries — pasar', cat: 'food', rp: 512000 },
  { on: '2026-11-14', what: 'Dentist check-up', cat: 'health', rp: 185000 },
  { on: '2026-11-12', what: 'TransJakarta + ojol', cat: 'transport', rp: 145000 },
  { on: '2026-11-10', what: 'Streaming subscriptions', cat: 'misc', rp: 149000 },
  { on: '2026-11-08', what: 'Weekly groceries — Super Indo', cat: 'food', rp: 498000 },
  { on: '2026-11-05', what: 'Rent — November', cat: 'housing', rp: 3500000 },
  { on: '2026-11-03', what: 'Board games night snacks', cat: 'leisure', rp: 96000 },
  { on: '2026-11-01', what: 'Transfer to emergency fund', cat: 'savings', rp: 1500000 },
];

// Income vs spending, June–November 2026. Each row: [month, income, spent]
// in millions of rupiah.
export const HISTORY = [
  ['Jun', 12.5, 11.9],
  ['Jul', 12.5, 12.4],
  ['Aug', 13.1, 12.2],
  ['Sep', 12.5, 11.6],
  ['Oct', 12.5, 12.1],
  ['Nov', 12.5, 12.75],
];

export const GOALS = [
  { key: 'emergency', label: 'Emergency fund', target: 37500000, saved: 18750000, note: '3 months of essential spending' },
  { key: 'holiday', label: 'Holiday in Bali', target: 8000000, saved: 5200000, note: 'Flights + 4 nights, March 2027' },
  { key: 'laptop', label: 'New laptop', target: 12000000, saved: 3600000, note: 'For freelance design work' },
  { key: 'education', label: 'Children’s education fund', target: 50000000, saved: 11000000, note: 'Top up Rp 500,000 a month' },
];

export const NAV = [
  { to: '#/', label: 'Dashboard', page: 'Dashboard' },
  { to: '#/planner', label: 'Planner', page: 'Budget Planner' },
  { to: '#/tracker', label: 'Tracker', page: 'Expense Tracker' },
  { to: '#/goals', label: 'Goals', page: 'Savings Goals' },
  { to: '#/tips', label: 'Guides', page: 'Guides & Calculators' },
];

export function idr(n) {
  return 'Rp ' + Math.round(n).toLocaleString('en-US');
}

export function idrShort(n) {
  if (n >= 1e6) {
    const m = n / 1e6;
    return 'Rp ' + (Number.isInteger(m) ? m : m.toFixed(2)) + 'M';
  }
  if (n >= 1e3) return 'Rp ' + Math.round(n / 1e3) + 'K';
  return idr(n);
}

export function findCategory(key) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

export function incomeTotal() {
  return INCOME.salary + INCOME.side;
}

export function plannedSum() {
  return BUDGET.reduce((sum, row) => sum + row.planned, 0);
}

export function spentSum() {
  return BUDGET.reduce((sum, row) => sum + row.spent, 0);
}

export function spentByCat(cat) {
  return BUDGET.find((row) => row.cat === cat)?.spent ?? 0;
}

export function plannedByCat(cat) {
  return BUDGET.find((row) => row.cat === cat)?.planned ?? 0;
}

// Totals split by kind: needs / wants / savings. `amounts` maps a category
// key to an amount; pass BUDGET rows mapped to `spent` or `planned`.
export function splitByKind(amounts) {
  const totals = { needs: 0, wants: 0, savings: 0 };
  for (const c of CATEGORIES) totals[c.kind] += amounts[c.key] ?? 0;
  return totals;
}

export function amountsByCat(field) {
  const out = {};
  for (const row of BUDGET) out[row.cat] = row[field];
  return out;
}
