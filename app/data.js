// RumahKas data: a sample household (the Hartonos, Jakarta) for November 2026.
// All amounts in Indonesian rupiah. The planner, tracker and goals pages let
// the visitor edit everything; edits are kept in the browser (localStorage).

export const META = {
  name: 'RumahKas',
  tagline: 'A household budget planner that shows where every rupiah goes.',
  household: 'The Hartono family · Jakarta · 2 adults, 2 children',
  month: 'November 2026',
  updated: 'November 2026',
};

export const CATEGORIES = [
  { id: 'housing', name: 'Housing & rent', group: 'needs', color: '#0f766e' },
  { id: 'food', name: 'Food & groceries', group: 'needs', color: '#2563eb' },
  { id: 'transport', name: 'Transport', group: 'needs', color: '#7c3aed' },
  { id: 'utilities', name: 'Utilities & bills', group: 'needs', color: '#0891b2' },
  { id: 'education', name: 'Education', group: 'needs', color: '#059669' },
  { id: 'health', name: 'Health', group: 'needs', color: '#dc2626' },
  { id: 'leisure', name: 'Leisure & fun', group: 'wants', color: '#d97706' },
  { id: 'clothing', name: 'Clothing & personal', group: 'wants', color: '#db2777' },
  { id: 'misc', name: 'Miscellaneous', group: 'wants', color: '#65a30d' },
  { id: 'savings', name: 'Savings & investing', group: 'savings', color: '#ea580c' },
];

// Planned budget and what was actually spent, November 2026.
export const PLAN = {
  income: { salary: 11000000, side: 1500000 },
  planned: {
    housing: 3500000, food: 2800000, transport: 1200000, utilities: 650000,
    education: 1000000, health: 400000, leisure: 600000, clothing: 350000,
    misc: 500000, savings: 1500000,
  },
  actual: {
    housing: 3500000, food: 2965000, transport: 1140000, utilities: 712000,
    education: 1000000, health: 285000, leisure: 845000, clothing: 420000,
    misc: 380000, savings: 1500000,
  },
};

// Recent transactions, November 2026.
export const TRANSACTIONS = [
  { date: '2026-11-24', desc: 'Weekly groceries — Super Indo', cat: 'food', amount: 486000 },
  { date: '2026-11-23', desc: 'Electricity token (PLN)', cat: 'utilities', amount: 312000 },
  { date: '2026-11-22', desc: 'Cinema + popcorn (family)', cat: 'leisure', amount: 285000 },
  { date: '2026-11-21', desc: 'Petrol — Pertalite', cat: 'transport', amount: 200000 },
  { date: '2026-11-20', desc: 'School books & supplies', cat: 'education', amount: 340000 },
  { date: '2026-11-19', desc: 'Dinner out — warteg + sate', cat: 'food', amount: 164000 },
  { date: '2026-11-18', desc: 'Internet (Indihome)', cat: 'utilities', amount: 400000 },
  { date: '2026-11-17', desc: 'New school shoes', cat: 'clothing', amount: 275000 },
  { date: '2026-11-15', desc: 'Weekly groceries — pasar', cat: 'food', amount: 512000 },
  { date: '2026-11-14', desc: 'Dentist check-up', cat: 'health', amount: 185000 },
  { date: '2026-11-12', desc: 'TransJakarta + ojol', cat: 'transport', amount: 145000 },
  { date: '2026-11-10', desc: 'Streaming subscriptions', cat: 'misc', amount: 149000 },
  { date: '2026-11-08', desc: 'Weekly groceries — Super Indo', cat: 'food', amount: 498000 },
  { date: '2026-11-05', desc: 'Rent — November', cat: 'housing', amount: 3500000 },
  { date: '2026-11-03', desc: 'Board games night snacks', cat: 'leisure', amount: 96000 },
  { date: '2026-11-01', desc: 'Transfer to emergency fund', cat: 'savings', amount: 1500000 },
];

// Income vs spending, June–November 2026 (millions of rupiah).
export const HISTORY = [
  { month: 'Jun', income: 12.5, spent: 11.9 }, { month: 'Jul', income: 12.5, spent: 12.4 },
  { month: 'Aug', income: 13.1, spent: 12.2 }, { month: 'Sep', income: 12.5, spent: 11.6 },
  { month: 'Oct', income: 12.5, spent: 12.1 }, { month: 'Nov', income: 12.5, spent: 12.75 },
];

export const GOALS = [
  { id: 'emergency', name: 'Emergency fund', target: 37500000, saved: 18750000, note: '3 months of essential spending' },
  { id: 'holiday', name: 'Holiday in Bali', target: 8000000, saved: 5200000, note: 'Flights + 4 nights, March 2027' },
  { id: 'laptop', name: 'New laptop', target: 12000000, saved: 3600000, note: 'For freelance design work' },
  { id: 'education', name: 'Children’s education fund', target: 50000000, saved: 11000000, note: 'Top up Rp 500,000 a month' },
];

export const NAV = [
  { hash: '#/', label: 'Dashboard', title: 'Dashboard' },
  { hash: '#/planner', label: 'Planner', title: 'Budget Planner' },
  { hash: '#/tracker', label: 'Tracker', title: 'Expense Tracker' },
  { hash: '#/goals', label: 'Goals', title: 'Savings Goals' },
  { hash: '#/tips', label: 'Guides', title: 'Guides & Calculators' },
];

export function rp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('en-US');
}
export function rpShort(n) {
  if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 2) + 'M';
  if (n >= 1e3) return 'Rp ' + Math.round(n / 1e3) + 'K';
  return rp(n);
}
export function catById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}
export function totalIncome() {
  return PLAN.income.salary + PLAN.income.side;
}
export function totalPlanned() {
  return Object.values(PLAN.planned).reduce((a, b) => a + b, 0);
}
export function totalActual() {
  return Object.values(PLAN.actual).reduce((a, b) => a + b, 0);
}
export function groupTotals(amounts) {
  const g = { needs: 0, wants: 0, savings: 0 };
  for (const c of CATEGORIES) g[c.group] += amounts[c.id] || 0;
  return g;
}
