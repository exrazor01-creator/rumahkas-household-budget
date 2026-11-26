// Browser state for RumahKas: the visitor's edits (planner amounts, added
// expenses, goal top-ups) live in localStorage and seed from the sample
// household the first time the site loads.

import { BUDGET, INCOME, TRANSACTIONS, GOALS } from './data.js';

const KEY = 'rumahkas-v1';

const clone = (x) => JSON.parse(JSON.stringify(x));

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.planned && parsed?.transactions && parsed?.goals) {
        // States saved before income was persisted carry no income: keep
        // the sample income instead of dropping the whole state.
        parsed.income = {
          salary: parsed.income?.salary ?? INCOME.salary,
          side: parsed.income?.side ?? INCOME.side,
        };
        return parsed;
      }
    }
  } catch {
    // Corrupted storage: fall through to the seed.
  }
  return seed();
}

export function seed() {
  const planned = {};
  for (const row of BUDGET) planned[row.cat] = row.planned;
  return {
    planned,
    income: { salary: INCOME.salary, side: INCOME.side },
    transactions: clone(TRANSACTIONS),
    goals: clone(GOALS),
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: edits just don't persist.
  }
}

export function resetState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  return seed();
}
