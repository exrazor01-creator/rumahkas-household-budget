// Router for RumahKas: hash routes, one page per section. Renders into
// #app, updates the title and nav state, then wires the page's controls.

import { VIEWS, pageTitle, wire } from './views.js';
import { NAV, META } from './data.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');

nav.innerHTML = NAV.map(n => `<a href="${n.hash}" data-route="${n.hash.slice(1)}">${n.label}</a>`).join('');

function route() {
  const path = location.hash.replace(/^#/, '') || '/';
  const render = VIEWS[path] || VIEWS['/'];
  document.title = pageTitle(path);
  app.innerHTML = `<h1>${document.title.split(' · ')[0]}</h1>` + render();
  nav.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === path);
  });
  wire(path, route);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', route);
route();

// Footer note, kept in one place.
document.getElementById('foot-note').textContent =
  `${META.name} · ${META.household} · ${META.tagline} Updated ${META.updated}.`;
