// Router for RumahKas: hash routes, one page per section. Each navigation
// renders into #app, updates the document title and the nav highlight,
// then wires that page's controls.

import { VIEWS, pageTitle, wire } from './views.js';
import { NAV, META } from './data.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');

for (const item of NAV) {
  const link = document.createElement('a');
  link.href = item.to;
  link.dataset.route = item.to.slice(1);
  link.textContent = item.label;
  nav.appendChild(link);
}

function render() {
  const path = location.hash.replace(/^#/, '') || '/';
  const view = VIEWS[path] ?? VIEWS['/'];
  document.title = pageTitle(path);
  app.innerHTML = `<h1>${document.title.split(' · ')[0]}</h1>${view()}`;
  for (const link of nav.querySelectorAll('a')) {
    link.classList.toggle('active', link.dataset.route === path);
  }
  wire(path, render);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();

// Footer note, kept in one place.
document.getElementById('foot-note').textContent =
  `${META.name} · ${META.household} · ${META.tagline} Updated ${META.updated}.`;
