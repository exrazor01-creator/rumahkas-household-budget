// Page renderers for RumahKas. Each returns HTML for <main>; main.js wires
// the controls after insertion. Amounts are in rupiah; state (the visitor's
// edits) lives in store.js and seeds from data.js.

import { META, CATEGORIES, PLAN, HISTORY, NAV, rp, rpShort, catById, totalIncome, groupTotals } from './data.js';
import { loadState, saveState, resetState } from './store.js';
import { donut, hbars, groupedBars } from './charts.js';

let state = loadState();
export function getState() { return state; }

function card(title, body, note) {
  return `<section class="card"><h2>${title}</h2>${body}${note ? `<p class="note">${note}</p>` : ''}</section>`;
}

function actualTotals() { return PLAN.actual; }

function healthScore() {
  const income = totalIncome();
  const actual = actualTotals();
  const spent = Object.entries(actual).filter(([k]) => k !== 'savings').reduce((a, [, v]) => a + v, 0);
  const saved = actual.savings || 0;
  const saveRate = saved / income;
  const savePts = Math.round(Math.min(saveRate / 0.20, 1) * 40);
  const over = spent / income;
  const budgetPts = over <= 1 ? 30 : Math.max(0, Math.round(30 - (over - 1) * 300));
  const needs = groupTotals(actual).needs / income;
  const needsPts = needs <= 0.5 ? 30 : needs >= 0.8 ? 10 : Math.round(30 - (needs - 0.5) / 0.3 * 20);
  const total = savePts + budgetPts + needsPts;
  const verdict = total >= 80 ? 'Healthy — keep it up' : total >= 60 ? 'Fair — a little tightening helps' : 'Stretched — needs attention';
  return { total, savePts, budgetPts, needsPts, saveRate, over, needs, verdict };
}

export function viewDashboard() {
  const income = totalIncome();
  const actual = actualTotals();
  const spent = Object.entries(actual).filter(([k]) => k !== 'savings').reduce((a, [, v]) => a + v, 0);
  const h = healthScore();
  const groups = groupTotals(actual);
  const spendRows = CATEGORIES.filter(c => c.id !== 'savings').map(c => ({
    label: c.name, value: actual[c.id] || 0, color: c.color, display: rpShort(actual[c.id] || 0),
  })).sort((a, b) => b.value - a.value);
  const alerts = CATEGORIES.filter(c => c.id !== 'savings' && (actual[c.id] || 0) > (PLAN.planned[c.id] || 0))
    .map(c => `<li><b>${c.name}</b> is ${rp((actual[c.id] || 0) - (PLAN.planned[c.id] || 0))} over plan (${rp(actual[c.id])} spent vs ${rp(PLAN.planned[c.id])} planned).</li>`).join('');
  return `
  <p class="lede">${META.household} · ${META.month}. Income ${rp(income)} a month —
  this month the family spent ${rp(spent)} and saved ${rp(actual.savings)}.</p>
  <section class="kpis" aria-label="Month at a glance">
    <article class="kpi"><div class="kpi-label">Income · ${META.month}</div><div class="kpi-value">${rp(income)}</div><p>Salary ${rp(PLAN.income.salary)} + side income ${rp(PLAN.income.side)}.</p></article>
    <article class="kpi"><div class="kpi-label">Spent (excl. savings)</div><div class="kpi-value">${rp(spent)}</div><p>${(h.over * 100).toFixed(0)}% of income — ${h.over > 1 ? 'over income' : 'within income'}.</p></article>
    <article class="kpi"><div class="kpi-label">Saved</div><div class="kpi-value">${rp(actual.savings)}</div><p>${(h.saveRate * 100).toFixed(0)}% savings rate · target 20%.</p></article>
    <article class="kpi"><div class="kpi-label">Budget health</div><div class="kpi-value">${h.total}<span class="kpi-of">/100</span></div><p>${h.verdict}.</p></article>
  </section>
  <div class="grid2">
    ${card('Where November’s money went',
      `<div class="donut-wrap">${donut(spendRows, { centre: rpShort(spent), centreSub: 'spent in Nov' })}</div>
       <ul class="legend">${spendRows.map(r => `<li><span class="sw" style="background:${r.color}"></span>${r.label} — <b>${r.display}</b></li>`).join('')}</ul>`)}
    ${card('50 / 30 / 20 check',
      `<p>Needs <b>${rp(groups.needs)}</b> (${(groups.needs / income * 100).toFixed(0)}% of income, rule says 50%) ·
      Wants <b>${rp(groups.wants)}</b> (${(groups.wants / income * 100).toFixed(0)}%, rule says 30%) ·
      Savings <b>${rp(groups.savings)}</b> (${(groups.savings / income * 100).toFixed(0)}%, rule says 20%).</p>
      ${hbars([
        { label: 'Needs', value: Math.round(groups.needs / income * 100), color: '#0f766e', display: Math.round(groups.needs / income * 100) + '%' },
        { label: 'Wants', value: Math.round(groups.wants / income * 100), color: '#d97706', display: Math.round(groups.wants / income * 100) + '%' },
        { label: 'Savings', value: Math.round(groups.savings / income * 100), color: '#ea580c', display: Math.round(groups.savings / income * 100) + '%' },
      ], { labelW: 90 })}
      <p class="note">Jakarta reality: housing alone takes 28% of income, so needs run high. The fix is not a smaller flat — it is capping wants and automating the transfer to savings on payday.</p>`)}
  </div>
  <div class="grid2">
    ${card('Income vs spending, Jun–Nov 2026 (Rp M)',
      groupedBars(HISTORY.map(x => x.month), HISTORY.map(x => x.income), HISTORY.map(x => x.spent)),
      'November is the only month spending beat income — leisure and food ran over plan.')}
    ${card('Health score breakdown',
      `<dl class="facts">
        <div><dt>Savings rate (${(h.saveRate * 100).toFixed(0)}% of income)</dt><dd>${h.savePts} / 40</dd></div>
        <div><dt>Within budget (${(h.over * 100).toFixed(0)}% spent)</dt><dd>${h.budgetPts} / 30</dd></div>
        <div><dt>Needs share (${(h.needs * 100).toFixed(0)}% of income)</dt><dd>${h.needsPts} / 30</dd></div>
      </dl>
      ${alerts ? `<h3>Over budget this month</h3><ul class="bullets">${alerts}</ul>` : '<p>Nothing over budget this month.</p>'}
      <p><button class="btn" id="reset-demo" type="button">Reset demo data</button></p>`)}
  </div>
  <p class="source">Sample household for illustration. Edit the plan on the Planner page — your changes stay in your browser.</p>`;
}

export function viewPlanner() {
  const income = totalIncome();
  const plannedTotal = Object.values(state.planned).reduce((a, b) => a + b, 0);
  const rows = CATEGORIES.map(c => {
    const planned = state.planned[c.id] || 0;
    const actual = PLAN.actual[c.id] || 0;
    const diff = planned - actual;
    return `<tr>
      <td><span class="sw" style="background:${c.color}"></span> ${c.name} <span class="tag">${c.group}</span></td>
      <td><input type="number" min="0" step="50000" value="${planned}" data-cat="${c.id}" aria-label="Planned ${c.name}"></td>
      <td>${rp(actual)}</td>
      <td class="${diff < 0 ? 'over' : 'under'}">${diff < 0 ? '−' : '+'}${rp(Math.abs(diff))}</td>
    </tr>`;
  }).join('');
  return `
  <p class="lede">Set the plan for ${META.month}. Change any amount — the totals,
  the remaining money and the 50/30/20 split update as you type. Saving stores
  the plan in your browser.</p>
  <div class="toolbar">
    <label>Salary <input type="number" id="inc-salary" min="0" step="100000" value="${PLAN.income.salary}"></label>
    <label>Side income <input type="number" id="inc-side" min="0" step="100000" value="${PLAN.income.side}"></label>
    <span class="toolbar-total" id="inc-total">Income: <b>${rp(income)}</b></span>
  </div>
  <div class="tbl-wrap">
  <table class="tbl">
    <thead><tr><th>Category</th><th>Planned (Rp)</th><th>Spent in Nov</th><th>Planned − spent</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td><b>Total planned</b></td><td id="planned-total"><b>${rp(plannedTotal)}</b></td><td>${rp(Object.values(PLAN.actual).reduce((a, b) => a + b, 0))}</td><td id="remaining"><b>${rp(income - plannedTotal)}</b> left</td></tr></tfoot>
  </table>
  </div>
  <div class="grid2" style="margin-top:16px">
    ${card('50 / 30 / 20 on your plan', `<div id="plan-split"></div>`)}
    ${card('Save your plan', `<p>Your plan is stored only in this browser — nothing is uploaded.</p>
      <p><button class="btn" id="save-plan" type="button">Save plan</button>
      <button class="btn ghost" id="reset-plan" type="button">Back to sample plan</button></p>
      <p class="note" id="plan-msg" aria-live="polite"></p>`)}
  </div>`;
}

export function viewTracker() {
  const options = CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
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
  return `
  <p class="lede">Four goals, one habit: move money to them on payday, before
  spending starts. Add funds to any goal — it is stored in your browser.</p>
  <div class="goals">${state.goals.map(g => {
    const pct = Math.min(100, Math.round(g.saved / g.target * 100));
    return `<article class="card goal">
      <h2>${g.name}</h2>
      <p class="note">${g.note}</p>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
      <p><b>${rp(g.saved)}</b> of ${rp(g.target)} · <b>${pct}%</b> · ${rp(g.target - g.saved)} to go</p>
      <label>Add funds (Rp) <input type="number" min="1000" step="1000" value="100000" data-goal="${g.id}"></label>
      <button class="btn" type="button" data-add-goal="${g.id}">Add to goal</button>
    </article>`;
  }).join('')}</div>
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
      <p>On the Hartonos’ ${rp(totalIncome())} income, the rule would mean
      ${rp(totalIncome() * 0.5)} needs, ${rp(totalIncome() * 0.3)} wants and
      ${rp(totalIncome() * 0.2)} savings. Their actual split is
      ${Math.round(groupTotals(PLAN.actual).needs / totalIncome() * 100)} /
      ${Math.round(groupTotals(PLAN.actual).wants / totalIncome() * 100)} /
      ${Math.round(groupTotals(PLAN.actual).savings / totalIncome() * 100)}.</p>`)}
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
  const item = NAV.find(n => n.hash === '#' + path);
  return item ? `${item.title} · RumahKas` : 'RumahKas · Household Budget Planner';
}

// Wire page-specific controls after a render. Called by main.js.
export function wire(path, rerender) {
  if (path === '/') {
    const btn = document.getElementById('reset-demo');
    if (btn) btn.addEventListener('click', () => {
      state = resetState();
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
      const plannedTotal = inputs.reduce((a, el) => a + (Number(el.value) || 0), 0);
      document.getElementById('inc-total').innerHTML = `Income: <b>${rp(income)}</b>`;
      document.getElementById('planned-total').innerHTML = `<b>${rp(plannedTotal)}</b>`;
      const left = income - plannedTotal;
      const rem = document.getElementById('remaining');
      rem.innerHTML = `<b>${rp(left)}</b> ${left < 0 ? 'over income' : 'left'}`;
      rem.classList.toggle('over', left < 0);
      const amounts = {};
      inputs.forEach(el => { amounts[el.dataset.cat] = Number(el.value) || 0; });
      const g = groupTotals(amounts);
      document.getElementById('plan-split').innerHTML = hbars([
        { label: 'Needs', value: Math.round(g.needs / income * 100) || 0, color: '#0f766e', display: Math.round(g.needs / income * 100) + '%' },
        { label: 'Wants', value: Math.round(g.wants / income * 100) || 0, color: '#d97706', display: Math.round(g.wants / income * 100) + '%' },
        { label: 'Savings', value: Math.round(g.savings / income * 100) || 0, color: '#ea580c', display: Math.round(g.savings / income * 100) + '%' },
      ], { labelW: 90 }) + `<p class="note">Rule of thumb: 50 / 30 / 20. ${left < 0 ? 'The plan currently spends more than the income — trim a category.' : 'The plan fits inside the income.'}</p>`;
    };
    inputs.forEach(el => el.addEventListener('input', refresh));
    salary.addEventListener('input', refresh);
    side.addEventListener('input', refresh);
    document.getElementById('save-plan').addEventListener('click', () => {
      inputs.forEach(el => { state.planned[el.dataset.cat] = Number(el.value) || 0; });
      PLAN.income.salary = Number(salary.value) || 0;
      PLAN.income.side = Number(side.value) || 0;
      saveState(state);
      msg.textContent = 'Plan saved in this browser.';
    });
    document.getElementById('reset-plan').addEventListener('click', () => {
      state = resetState();
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
    const render = () => {
      const f = filter.value;
      const rows = [...state.transactions]
        .filter(t => !f || t.cat === f)
        .sort((a, b) => b.date.localeCompare(a.date));
      body.innerHTML = rows.map((t, i) => {
        const idx = state.transactions.indexOf(t);
        return `<tr><td>${t.date}</td><td>${t.desc}</td><td>${catById(t.cat).name}</td><td>${rp(t.amount)}</td>
        <td><button class="btn small" type="button" data-del="${idx}">Delete</button></td></tr>`;
      }).join('') || `<tr><td colspan="5">No expenses in this filter.</td></tr>`;
      const shown = rows.reduce((a, t) => a + t.amount, 0);
      totalEl.innerHTML = `Showing <b>${rows.length}</b> expenses · total <b>${rp(shown)}</b>`;
      const sums = {};
      state.transactions.forEach(t => { sums[t.cat] = (sums[t.cat] || 0) + t.amount; });
      const catRows = Object.entries(sums).map(([id, v]) => ({
        label: catById(id).name, value: v, color: catById(id).color, display: rpShort(v),
      })).sort((a, b) => b.value - a.value);
      byCat.innerHTML = card('Totals by category (all rows in this table)', hbars(catRows, { labelW: 180 }));
      body.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => {
        state.transactions.splice(Number(btn.dataset.del), 1);
        saveState(state);
        render();
      }));
    };
    filter.addEventListener('change', render);
    document.getElementById('add-form').addEventListener('submit', e => {
      e.preventDefault();
      const desc = document.getElementById('add-desc').value.trim();
      const amount = Number(document.getElementById('add-amount').value);
      const date = document.getElementById('add-date').value;
      if (!desc || !amount || !date) return;
      state.transactions.push({ date, desc, cat: document.getElementById('add-cat').value, amount });
      saveState(state);
      e.target.reset();
      document.getElementById('add-date').value = '2026-11-26';
      render();
    });
    render();
  }
  if (path === '/goals') {
    document.querySelectorAll('[data-add-goal]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.addGoal;
      const input = document.querySelector(`input[data-goal="${id}"]`);
      const amount = Number(input.value) || 0;
      if (amount <= 0) return;
      const g = state.goals.find(x => x.id === id);
      g.saved += amount;
      saveState(state);
      rerender();
    }));
    document.getElementById('goal-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('goal-name').value.trim();
      const target = Number(document.getElementById('goal-target').value);
      const saved = Number(document.getElementById('goal-saved').value) || 0;
      if (!name || !target) return;
      state.goals.push({ id: 'g' + Date.now(), name, target, saved, note: 'Added by you' });
      saveState(state);
      rerender();
    });
  }
  if (path === '/tips') {
    const efMonthly = document.getElementById('ef-monthly');
    const efOut = document.getElementById('ef-out');
    const drawEf = () => {
      const m = Number(efMonthly.value) || 0;
      efOut.innerHTML = `3 months: <b>${rp(m * 3)}</b><br>6 months: <b>${rp(m * 6)}</b>`;
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
      if (!b || !p) { out.textContent = 'Enter a balance and a monthly payment.'; return; }
      if (r > 0 && p <= b * r) {
        out.innerHTML = `The payment <b>${rp(p)}</b> does not cover the monthly interest of <b>${rp(b * r)}</b> — the balance would grow. Raise the payment above ${rp(Math.ceil(b * r / 1000) * 1000)}.`;
        return;
      }
      let months = 0, interest = 0;
      while (b > 0 && months < 600) {
        const i = b * r;
        interest += i;
        b = b + i - p;
        months++;
      }
      out.innerHTML = months >= 600
        ? 'More than 50 years at this payment — raise the monthly amount.'
        : `Paid off in <b>${months} month${months === 1 ? '' : 's'}</b> (${(months / 12).toFixed(1)} years), total interest <b>${rp(interest)}</b>.`;
    };
    [bal, apr, pay].forEach(el => el.addEventListener('input', drawDebt));
    drawDebt();
  }
}
