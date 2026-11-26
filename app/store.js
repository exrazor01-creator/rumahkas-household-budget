// Browser state for RumahKas: the visitor's edits (planner amounts, added
// expenses, goal top-ups) are kept in localStorage and seed from the sample
// household the first time the site loads.

import { PLAN, TRANSACTIONS, GOALS } from './data.js';

const KEY = 'rumahkas-v1';

function clone(x) { return JSON.parse(JSON.stringify(x)); }

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.planned && s.transactions && s.goals) return s;
    }
  } catch { /* corrupted storage: fall through to the seed */ }
  return seed();
}

export function seed() {
  return { planned: clone(PLAN.planned), transactions: clone(TRANSACTIONS), goals: clone(GOALS) };
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
}

export function resetState() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  return seed();
}
