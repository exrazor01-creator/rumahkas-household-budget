// Page renderers for RumahKas. Each function returns the HTML for <main>;
// main.js wires the controls up after inserting it. Amounts are in rupiah.
// The visitor's edits live in store.js and seed from data.js.

import { META, CATEGORIES, BUDGET, INCOME, HISTORY, NAV, idr, idrShort, findCategory, incomeTotal, spentByCat, splitByKind, amountsByCat } from './data.js';
import { loadState, saveState, resetState } from './store.js';
import { donut, hbars, groupedBars } from './charts.js';

let state = loadState();
export function getState() { return state; }

// INCOME is the live source the pages read; keep it in step with the
// persisted state so an edited salary survives a reload, like the plan.
function applyIncome() {
  INCOME.salary = state.income?.salary ?? INCOME.salary;
  INCOME.side = state.income?.side ?? INCOME.side;
}
applyIncome();

function card(title, body, note) {
  const foot = note ? `<p class="note">${note}</p>` : '';
  return `<section class="card"><h2>${title}</h2>${body}${foot}</section>`;
}

function spentExcludingSavings() {
  return BUDGET.filter((row) => row.cat !== 'savings').reduce((sum, row) => sum + row.spent, 0);
}

function healthScore() {
  const income = incomeTotal();
  const spent = spentExcludingSavings();
  const saved = spentByCat('savings');
  const saveRate = saved / income;
  const savePts = Math.round(Math.min(saveRate / 0.2, 1) * 40);
  const over = spent / income;
  const budgetPts = over <= 1 ? 30 : Math.max(0, Math.round(30 - (over - 1) * 300));
  const needsShare = splitByKind(amountsByCat('spent')).needs / income;
  const needsPts = needsShare <= 0.5 ? 30 : needsShare >= 0.8 ? 10 : Math.round(30 - ((needsShare - 0.5) / 0.3) * 20);
  const total = savePts + budgetPts + needsPts;
  const verdict = total >= 80 ? 'Healthy — keep it up' : total >= 60 ? 'Fair — a little tightening helps' : 'Stretched — needs attention';
  return { total, savePts, budgetPts, needsPts, saveRate, over, needsShare, verdict };
}

function spendRows() {
  return BUDGET.filter((row) => row.cat !== 'savings')
    .map((row) => {
      const cat = findCategory(row.cat);
      return { label: cat.label, value: row.spent, color: cat.colour, display: idrShort(row.spent) };
    })
    .sort((a, b) => b.value - a.value);
}

function overPlanList() {
  return BUDGET.filter((row) => row.cat !== 'savings' && row.spent > row.planned)
    .map((row) => {
      const cat = findCategory(row.cat);
      const gap = row.spent - row.planned;
      return `<li><b>${cat.label}</b> ran ${idr(gap)} over plan — ${idr(row.spent)} spent against ${idr(row.planned)} planned.</li>`;
    })
    .join('');
}

export function viewDashboard() {
  const income = incomeTotal();
  const spent = spentExcludingSavings();
  const saved = spentByCat('savings');
  const h = healthScore();
  const groups = splitByKind(amountsByCat('spent'));
  const rows = spendRows();
  const alerts = overPlanList();
  const pct = (part) => Math.round((part / income) * 100);
  return `
  <p class="lede">${META.household} · ${META.month}. Take-home pay is ${idr(income)} a month —
  in November the family spent ${idr(spent)} and put ${idr(saved)} aside.</p>
  <section class="kpis" aria-label="Month at a glance">
    <article class="kpi"><div class="kpi-label">Income · ${META.month}</div><div class="kpi-value">${idr(income)}</div><p>Salary ${idr(INCOME.salary)} plus side income ${idr(INCOME.side)}.</p></article>
    <article class="kpi"><div class="kpi-label">Spent (excl. savings)</div><div class="kpi-value">${idr(spent)}</div><p>${Math.round(h.over * 100)}% of income — ${h.over > 1 ? 'over income' : 'within income'}.</p></article>
    <article class="kpi"><div class="kpi-label">Saved</div><div class="kpi-value">${idr(saved)}</div><p>${Math.round(h.saveRate * 100)}% savings rate · target 20%.</p></article>
    <article class="kpi"><div class="kpi-label">Budget health</div><div class="kpi-value">${h.total}<span class="kpi-of">/100</span></div><p>${h.verdict}.</p></article>
  </section>
  <div class="grid2">
    ${card('Where November’s money went',
      `<div class="donut-wrap">${donut(rows, { centre: idrShort(spent), centreSub: 'spent in Nov' })}</div>
       <ul class="legend">${rows.map((r) => `<li><span class="sw" style="background:${r.color}"></span>${r.label} — <b>${r.display}</b></li>`).join('')}</ul>`)}
    ${card('50 / 30 / 20 check',
      `<p>Needs <b>${idr(groups.needs)}</b> (${pct(groups.needs)}% of income, rule says 50%) ·
      Wants <b>${idr(groups.wants)}</b> (${pct(groups.wants)}%, rule says 30%) ·
      Savings <b>${idr(groups.savings)}</b> (${pct(groups.savings)}%, rule says 20%).</p>
      ${hbars([
        { label: 'Needs', value: pct(groups.needs), color: '#0f766e', display: pct(groups.needs) + '%' },
        { label: 'Wants', value: pct(groups.wants), color: '#d97706', display: pct(groups.wants) + '%' },
        { label: 'Savings', value: pct(groups.savings), color: '#ea580c', display: pct(groups.savings) + '%' },
      ], { labelW: 90 })}
      <p class="note">Jakarta reality: housing alone takes 28% of income, so needs run high. The fix is not a smaller flat — it is capping wants and automating the transfer to savings on payday.</p>`)}
  </div>
  <div class="grid2">
    ${card('Income vs spending, Jun–Nov 2026 (Rp M)',
      groupedBars(HISTORY.map((row) => row[0]), HISTORY.map((row) => row[1]), HISTORY.map((row) => row[2])),
      'November is the only month spending beat income — leisure and food ran over plan.')}
    ${card('Health score breakdown',
      `<dl class="facts">
        <div><dt>Savings rate (${Math.round(h.saveRate * 100)}% of income)</dt><dd>${h.savePts} / 40</dd></div>
        <div><dt>Within budget (${Math.round(h.over * 100)}% spent)</dt><dd>${h.budgetPts} / 30</dd></div>
        <div><dt>Needs share (${Math.round(h.needsShare * 100)}% of income)</dt><dd>${h.needsPts} / 30</dd></div>
      </dl>
      ${alerts ? `<h3>Over budget this month</h3><ul class="bullets">${alerts}</ul>` : '<p>Nothing over budget this month.</p>'}
      <p><button class="btn" id="reset-demo" type="button">Reset demo data</button></p>`)}
  </div>
  <p class="source">Sample household for illustration. Edit the plan on the Planner page — your changes stay in your browser.</p>`;
}

export function viewPlanner() {
  const income = incomeTotal();
  const plannedTotal = Object.values(state.planned).reduce((a, b) => a + b, 0);
  const spentTotal = BUDGET.reduce((sum, row) => sum + row.spent, 0);
  const rows = CATEGORIES.map((c) => {
    const planned = state.planned[c.key] ?? 0;
    const actual = spentByCat(c.key);
    const diff = planned - actual;
    const cls = diff < 0 ? 'over' : 'under';
    const sign = diff < 0 ? '−' : '+';
    return `<tr>
      <td><span class="sw" style="background:${c.colour}"></span> ${c.label} <span class="tag">${c.kind}</span></td>
      <td><input type="number" min="0" step="50000" value="${planned}" data-cat="${c.key}" aria-label="Planned ${c.label}"></td>
      <td>${idr(actual)}</td>
      <td class="${cls}">${sign}${idr(Math.abs(diff))}</td>
    </tr>`;
  }).join('');
  return `
  <p class="lede">Set the plan for ${META.month}. Change any amount — the totals,
  the money left over and the 50/30/20 split update as you type. Saving stores
  the plan in your browser.</p>
  <div class="toolbar">
    <label>Salary <input type="number" id="inc-salary" min="0" step="100000" value="${INCOME.salary}"></label>
    <label>Side income <input type="number" id="inc-side" min="0" step="100000" value="${INCOME.side}"></label>
    <span class="toolbar-total" id="inc-total">Income: <b>${idr(income)}</b></span>
  </div>
  <div class="tbl-wrap">
  <table class="tbl">
    <thead><tr><th>Category</th><th>Planned (Rp)</th><th>Spent in Nov</th><th>Planned − spent</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td><b>Total planned</b></td><td id="planned-total"><b>${idr(plannedTotal)}</b></td><td>${idr(spentTotal)}</td><td id="remaining"><b>${idr(income - plannedTotal)}</b> left</td></tr></tfoot>
  </table>
  </div>
  <div class="grid2" style="margin-top:16px">
    ${card('50 / 30 / 20 on your plan', '<div id="plan-split"></div>')}
    ${card('Save your plan', `<p>Your plan is stored only in this browser — nothing is uploaded.</p>
      <p><button class="btn" id="save-plan" type="button">Save plan</button>
      <button class="btn ghost" id="reset-plan" type="button">Back to sample plan</button></p>
      <p class="note" id="plan-msg" aria-live="polite"></p>`)}
  </div>`;
}

export function viewTracker() {
  const options = CATEGORIES.map((c) => `<option value="${c.key}">${c.label}</option>`).join('');
  return `
  <p class="lede">Every rupiah the Hartonos spent in November, as it happened.
  Add your own expense — it is stored in your browser and counted in the totals below.</p>
  <form id="add-form" class="add-form">
    <label>Description <input type="text" id="add-desc" required maxlength="80" placeholder="e.g. Weekly groceries"></label>
    <label>Category <select id="add-cat">${options}</select></label>
    <label>Amount (Rp) <input type="number" id="add-amount" required min="1000" step="1000" placeholder="250000"></label>
    <label>Date <input type="date" id="add-date" value="2026-11-26" required></label>
    <button class="btn" type="submit">Add expense</button>
  </form>
  <div class="toolbar">
    <label>Filter <select id="tx-filter"><option value="">All categories</option>${options}</select></label>
    <span class="toolbar-total" id="tx-total"></span>
  </div>
  <div class="tbl-wrap">
  <table class="tbl"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr></thead>
  <tbody id="tx-body"></tbody></table>
  </div>
  <p class="note">Showing the sample month’s transactions plus anything you add. Category totals below count only the rows in this table.</p>
  <div id="tx-by-cat" style="margin-top:16px"></div>`;
}

export function viewGoals() {
  const cards = state.goals.map((g) => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `<article class="card goal">
      <h2>${g.label}</h2>
      <p class="note">${g.note}</p>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
      <p><b>${idr(g.saved)}</b> of ${idr(g.target)} · <b>${pct}%</b> · ${idr(g.target - g.saved)} to go</p>
      <label>Add funds (Rp) <input type="number" min="1000" step="1000" value="100000" data-goal="${g.key}"></label>
      <button class="btn" type="button" data-add-goal="${g.key}">Add to goal</button>
    </article>`;
  }).join('');
  return `
  <p class="lede">Four goals, one habit: move money to them on payday, before
  spending starts. Add funds to any goal — it is stored in your browser.</p>
  <div class="goals">${cards}</div>
  <section class="card" style="margin-top:16px"><h2>Start a new goal</h2>
    <form id="goal-form" class="add-form">
      <label>Name <input type="text" id="goal-name" required maxlength="60" placeholder="e.g. New motorbike"></label>
      <label>Target (Rp) <input type="number" id="goal-target" required min="100000" step="100000" placeholder="5000000"></label>
      <label>Already saved (Rp) <input type="number" id="goal-saved" min="0" step="100000" value="0"></label>
      <button class="btn" type="submit">Add goal</button>
    </form>
    <p class="note" id="goal-msg" aria-live="polite"></p>
  </section>`;
}

export function viewTips() {
  const income = incomeTotal();
  const split = splitByKind(amountsByCat('spent'));
  const pct = (part) => Math.round((part / income) * 100);
  return `
  <p class="lede">Three rules that do most of the work — plus two calculators
  that run on your numbers, in your browser.</p>
  <div class="grid2">
    ${card('The 50 / 30 / 20 rule',
      `<p>Split take-home pay three ways: <b>50% needs</b> (rent, food, transport,
      bills), <b>30% wants</b> (eating out, fun, upgrades) and <b>20% savings</b>
      and debt payoff. It is a compass, not a law — in Jakarta, needs often run
      60–70%, so the honest version is: cap wants at 20% and automate savings
      on payday, before spending starts.</p>
      <p>On the Hartonos’ ${idr(income)} income, the rule would mean
      ${idr(income * 0.5)} needs, ${idr(income * 0.3)} wants and
      ${idr(income * 0.2)} savings. Their actual split is
      ${pct(split.needs)} / ${pct(split.wants)} / ${pct(split.savings)}.</p>`)}
    ${card('Pay yourself first',
      `<ul class="bullets">
        <li>Set an automatic transfer to savings for the day after payday.</li>
        <li>Keep the emergency fund in a separate account you do not see daily.</li>
        <li>Review once a month, 15 minutes: what went over, and why — not to feel guilty, to fix the plan.</li>
        <li>One “no-spend” day a week is worth more than a perfect spreadsheet.</li>
      </ul>`)}
  </div>
  <div class="grid2">
    ${card('Emergency fund calculator',
      `<label>Monthly essential spending (Rp)<br><input type="number" id="ef-monthly" min="0" step="100000" value="9550000"></label>
       <p id="ef-out" aria-live="polite"></p>
       <p class="note">3 months covers a short shock (job loss, hospital stay). 6 months is the comfortable target for a single-income household.</p>`)}
    ${card('Debt payoff calculator',
      `<label>Balance (Rp)<br><input type="number" id="debt-bal" min="0" step="100000" value="5000000"></label><br>
       <label>Annual interest (%)<br><input type="number" id="debt-apr" min="0" step="0.5" value="24"></label><br>
       <label>Monthly payment (Rp)<br><input type="number" id="debt-pay" min="0" step="50000" value="500000"></label>
       <p id="debt-out" aria-live="polite"></p>
       <p class="note">Simple amortisation: interest accrues monthly on the remaining balance. Paying more than the minimum is what shortens the loan.</p>`)}
  </div>
  <p class="source">Guides, not financial advice. Figures use the sample household; change the inputs to match your own.</p>`;
}

export const VIEWS = {
  '/': viewDashboard,
  '/planner': viewPlanner,
  '/tracker': viewTracker,
  '/goals': viewGoals,
  '/tips': viewTips,
};

export function pageTitle(path) {
  const item = NAV.find((n) => n.to === '#' + path);
  return item ? `${item.page} · RumahKas` : 'RumahKas · Household Budget Planner';
}

// Wire page-specific controls after a render. Called by main.js.
export function wire(path, rerender) {
  if (path === '/') {
    document.getElementById('reset-demo')?.addEventListener('click', () => {
      state = resetState();
      applyIncome();
      rerender();
    });
  }
  if (path === '/planner') {
    const inputs = [...document.querySelectorAll('input[data-cat]')];
    const salary = document.getElementById('inc-salary');
    const side = document.getElementById('inc-side');
    const msg = document.getElementById('plan-msg');
    const refresh = () => {
      const income = (Number(salary.value) || 0) + (Number(side.value) || 0);
      const plannedTotal = inputs.reduce((sum, el) => sum + (Number(el.value) || 0), 0);
      document.getElementById('inc-total').innerHTML = `Income: <b>${idr(income)}</b>`;
      document.getElementById('planned-total').innerHTML = `<b>${idr(plannedTotal)}</b>`;
      const left = income - plannedTotal;
      const rem = document.getElementById('remaining');
      rem.innerHTML = `<b>${idr(left)}</b> ${left < 0 ? 'over income' : 'left'}`;
      rem.classList.toggle('over', left < 0);
      const amounts = {};
      for (const el of inputs) amounts[el.dataset.cat] = Number(el.value) || 0;
      const g = splitByKind(amounts);
      const share = (part) => Math.round((part / income) * 100) || 0;
      document.getElementById('plan-split').innerHTML = hbars([
        { label: 'Needs', value: share(g.needs), color: '#0f766e', display: share(g.needs) + '%' },
        { label: 'Wants', value: share(g.wants), color: '#d97706', display: share(g.wants) + '%' },
        { label: 'Savings', value: share(g.savings), color: '#ea580c', display: share(g.savings) + '%' },
      ], { labelW: 90 }) + `<p class="note">Rule of thumb: 50 / 30 / 20. ${left < 0 ? 'The plan currently spends more than the income — trim a category.' : 'The plan fits inside the income.'}</p>`;
    };
    for (const el of inputs) el.addEventListener('input', refresh);
    salary.addEventListener('input', refresh);
    side.addEventListener('input', refresh);
    document.getElementById('save-plan').addEventListener('click', () => {
      for (const el of inputs) state.planned[el.dataset.cat] = Number(el.value) || 0;
      state.income = { salary: Number(salary.value) || 0, side: Number(side.value) || 0 };
      applyIncome();
      saveState(state);
      msg.textContent = 'Plan saved in this browser.';
    });
    document.getElementById('reset-plan').addEventListener('click', () => {
      state = resetState();
      applyIncome();
      saveState(state);
      rerender();
    });
    refresh();
  }
  if (path === '/tracker') {
    const body = document.getElementById('tx-body');
    const totalEl = document.getElementById('tx-total');
    const byCat = document.getElementById('tx-by-cat');
    const filter = document.getElementById('tx-filter');
    const renderRows = () => {
      const f = filter.value;
      const rows = [...state.transactions]
        .filter((t) => !f || t.cat === f)
        .sort((a, b) => b.on.localeCompare(a.on));
      body.innerHTML = rows.map((t) => {
        const idx = state.transactions.indexOf(t);
        return `<tr><td>${t.on}</td><td>${t.what}</td><td>${findCategory(t.cat).label}</td><td>${idr(t.rp)}</td>
        <td><button class="btn small" type="button" data-del="${idx}">Delete</button></td></tr>`;
      }).join('') || '<tr><td colspan="5">No expenses in this filter.</td></tr>';
      const shown = rows.reduce((sum, t) => sum + t.rp, 0);
      totalEl.innerHTML = `Showing <b>${rows.length}</b> expenses · total <b>${idr(shown)}</b>`;
      const sums = {};
      for (const t of state.transactions) sums[t.cat] = (sums[t.cat] || 0) + t.rp;
      const catRows = Object.entries(sums)
        .map(([key, value]) => {
          const cat = findCategory(key);
          return { label: cat.label, value, color: cat.colour, display: idrShort(value) };
        })
        .sort((a, b) => b.value - a.value);
      byCat.innerHTML = card('Totals by category (all rows in this table)', hbars(catRows, { labelW: 180 }));
      for (const btn of body.querySelectorAll('[data-del]')) {
        btn.addEventListener('click', () => {
          state.transactions.splice(Number(btn.dataset.del), 1);
          saveState(state);
          renderRows();
        });
      }
    };
    filter.addEventListener('change', renderRows);
    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const desc = document.getElementById('add-desc').value.trim();
      const amount = Number(document.getElementById('add-amount').value);
      const date = document.getElementById('add-date').value;
      if (!desc || !amount || !date) return;
      state.transactions.push({ on: date, what: desc, cat: document.getElementById('add-cat').value, rp: amount });
      saveState(state);
      e.target.reset();
      document.getElementById('add-date').value = '2026-11-26';
      renderRows();
    });
    renderRows();
  }
  if (path === '/goals') {
    for (const btn of document.querySelectorAll('[data-add-goal]')) {
      btn.addEventListener('click', () => {
        const key = btn.dataset.addGoal;
        const input = document.querySelector(`input[data-goal="${key}"]`);
        const amount = Number(input.value) || 0;
        if (amount <= 0) return;
        const g = state.goals.find((x) => x.key === key);
        g.saved += amount;
        saveState(state);
        rerender();
      });
    }
    document.getElementById('goal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('goal-name').value.trim();
      const target = Number(document.getElementById('goal-target').value);
      const saved = Number(document.getElementById('goal-saved').value) || 0;
      if (!name || !target) return;
      state.goals.push({ key: 'g' + Date.now(), label: name, target, saved, note: 'Added by you' });
      saveState(state);
      rerender();
    });
  }
  if (path === '/tips') {
    const efMonthly = document.getElementById('ef-monthly');
    const efOut = document.getElementById('ef-out');
    const drawEf = () => {
      const m = Number(efMonthly.value) || 0;
      efOut.innerHTML = `3 months: <b>${idr(m * 3)}</b><br>6 months: <b>${idr(m * 6)}</b>`;
    };
    efMonthly.addEventListener('input', drawEf);
    drawEf();
    const bal = document.getElementById('debt-bal');
    const apr = document.getElementById('debt-apr');
    const pay = document.getElementById('debt-pay');
    const out = document.getElementById('debt-out');
    const drawDebt = () => {
      let b = Number(bal.value) || 0;
      const r = (Number(apr.value) || 0) / 100 / 12;
      const p = Number(pay.value) || 0;
      if (!b || !p) {
        out.textContent = 'Enter a balance and a monthly payment.';
        return;
      }
      if (r > 0 && p <= b * r) {
        out.innerHTML = `The payment <b>${idr(p)}</b> does not cover the monthly interest of <b>${idr(b * r)}</b> — the balance would grow. Raise the payment above ${idr(Math.ceil((b * r) / 1000) * 1000)}.`;
        return;
      }
      let months = 0;
      let interest = 0;
      while (b > 0 && months < 600) {
        const i = b * r;
        interest += i;
        b = b + i - p;
        months++;
      }
      out.innerHTML = months >= 600
        ? 'More than 50 years at this payment — raise the monthly amount.'
        : `Paid off in <b>${months} month${months === 1 ? '' : 's'}</b> (${(months / 12).toFixed(1)} years), total interest <b>${idr(interest)}</b>.`;
    };
    for (const el of [bal, apr, pay]) el.addEventListener('input', drawDebt);
    drawDebt();
  }
}
