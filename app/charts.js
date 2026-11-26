// Small SVG chart helpers for RumahKas. No libraries: every chart is a
// plain SVG string built from the data, so the page works offline.

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Donut chart. rows: [{label, value, color}].
export function donut(rows, opts = {}) {
  const size = opts.size || 220, r = 80, cx = size / 2, cy = size / 2;
  const total = rows.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0, paths = '';
  rows.forEach(row => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += row.value;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    paths += `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${row.color}"><title>${esc(row.label)}: ${row.value}</title></path>`;
  });
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Donut chart" class="donut"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#efe9dd" stroke-width="34"/>${paths}<circle cx="${cx}" cy="${cy}" r="52" fill="#fffdf8"/><text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="13" font-weight="700" fill="#1f2937">${esc(opts.centre || '')}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="11" fill="#6b7280">${esc(opts.centreSub || '')}</text></svg>`;
}

// Horizontal bars: rows [{label, value, color, display}].
export function hbars(rows, opts = {}) {
  const w = opts.width || 640, rowH = opts.rowH || 30;
  const h = rows.length * rowH + 8;
  const max = Math.max(...rows.map(r => r.value), 1);
  const labelW = opts.labelW || 190;
  let out = '';
  rows.forEach(r => {
    const y = 6 + rows.indexOf(r) * rowH;
    const bw = (w - labelW - 90) * (r.value / max);
    out += `<text x="0" y="${y + 15}" font-size="12" fill="#1f2937">${esc(r.label)}</text>`;
    out += `<rect x="${labelW}" y="${y + 4}" width="${Math.max(bw, 2).toFixed(1)}" height="16" rx="3" fill="${r.color}"><title>${esc(r.label)}: ${r.display || r.value}</title></rect>`;
    out += `<text x="${labelW + bw + 6}" y="${y + 16}" font-size="12" fill="#1f2937">${esc(r.display || r.value)}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Horizontal bar chart" class="chart">${out}</svg>`;
}

// Grouped vertical bars: two series over the same labels.
export function groupedBars(labels, a, b, opts = {}) {
  const w = opts.width || 640, h = opts.height || 240, pad = { t: 16, r: 10, b: 30, l: 40 };
  const max = Math.max(...a, ...b, 1);
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const gw = iw / labels.length;
  let bars = '';
  labels.forEach((lab, i) => {
    const x = pad.l + i * gw;
    const ha = (a[i] / max) * ih, hb = (b[i] / max) * ih;
    bars += `<rect x="${(x + gw * 0.14).toFixed(1)}" y="${(pad.t + ih - ha).toFixed(1)}" width="${(gw * 0.3).toFixed(1)}" height="${ha.toFixed(1)}" rx="2" fill="#0f766e"><title>${esc(lab)} income: ${a[i]}</title></rect>`;
    bars += `<rect x="${(x + gw * 0.52).toFixed(1)}" y="${(pad.t + ih - hb).toFixed(1)}" width="${(gw * 0.3).toFixed(1)}" height="${hb.toFixed(1)}" rx="2" fill="#d97706"><title>${esc(lab)} spent: ${b[i]}</title></rect>`;
    bars += `<text x="${(x + gw / 2).toFixed(1)}" y="${h - 8}" text-anchor="middle" font-size="11" fill="#6b7280">${esc(lab)}</text>`;
  });
  const grid = [0, 0.5, 1].map(f => {
    const y = pad.t + ih * f;
    return `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="#efe9dd" stroke-width="1"/><text x="${pad.l - 5}" y="${y + 3}" text-anchor="end" font-size="10" fill="#6b7280">${(max * (1 - f)).toFixed(1)}</text>`;
  }).join('');
  const legend = `<g font-size="12" fill="#1f2937"><rect x="${pad.l}" y="0" width="11" height="11" rx="2" fill="#0f766e"/><text x="${pad.l + 16}" y="10">Income</text><rect x="${pad.l + 90}" y="0" width="11" height="11" rx="2" fill="#d97706"/><text x="${pad.l + 106}" y="10">Spent</text></g>`;
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Grouped bar chart" class="chart">${legend}${grid}${bars}</svg>`;
}
