# RumahKas — Household Budget Planner

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/exrazor01-creator/rumahkas-household-budget/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/exrazor01-creator/rumahkas-household-budget/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Built for the [make.fun best-household-budget-site bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457).

**RumahKas** is a household budget planner for one sample family — the
Hartonos of Jakarta, Rp 12,500,000 take-home a month. Every page is
editable, so a visitor can run their own numbers through it instead of
just reading the sample: edits are stored in the browser only, nothing is
uploaded.

## Pages

- **Dashboard** — the month at a glance: income, spending, savings and a
  budget-health score (66/100 for November) with its breakdown, a donut of
  where the money went, the 50/30/20 split, six months of income vs
  spending, and which categories ran over plan.
- **Planner** — set the plan for the month: income and every category, with
  live totals, money left over, and the 50/30/20 split updating as you
  type. Saving stores the plan in the browser.
- **Tracker** — 16 November transactions with an add-expense form, delete
  buttons, a category filter and totals by category.
- **Goals** — four savings goals with progress bars (emergency fund 50%,
  Bali holiday 65%, laptop 30%, education fund 22%); add funds to any goal
  or start a new one.
- **Guides** — the 50/30/20 rule explained against the Hartonos' real
  split, plus an emergency-fund calculator (3- and 6-month targets) and a
  debt payoff calculator (months to clear, total interest).

## How the numbers work

The health score is 40 points for the savings rate (20% earns the full
40), 30 for staying inside income, and 30 for keeping needs at or under
half of income. November scores 66: a 12% savings rate, spending at 90%
of income, and needs at 77% — Jakarta housing alone takes 28%.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no dependencies, no network requests — the site is static
files under `app/` (HTML + ES modules + hand-drawn SVG charts). A "Reset
demo data" button on the dashboard restores the sample household.

## Screenshots

The four screenshots in `screenshots/` are real renders of the site's own
code: dashboard, planner, tracker (desktop, 1280×800) and goals on a phone
(390×844).

## Tests

```sh
node ../test-wave16.mjs . 8082 budget   # from ~/workspace/makefun, with serve.ts running
```

The interaction checks cover adding and filtering expenses, live planner
totals, goal top-ups and the debt calculator, with no console errors.
