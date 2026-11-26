// Hand-drawn SVG charts for RumahKas — no libraries, so the pages work
// with no network at all. Each helper takes plain data and returns an SVG
// string the page templates drop straight into the markup.

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Donut chart. rows: [{label, value, color}]. Each slice is a stroked
// circle whose dash covers exactly its share of the circumference.
export function donut(rows, opts = {}) {
  const size = opts.size ?? 220;
  const mid = size / 2;
  const radius = 80;
  const circ = 2 * Math.PI * radius;
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  let covered = 0;
  const slices = rows.map((row) => {
    const share = row.value / total;
    const dash = (share * circ).toFixed(1);
    const gap = circ.toFixed(1);
    const start = (-covered * circ).toFixed(1);
    covered += share;
    return `<circle cx="${mid}" cy="${mid}" r="${radius}" fill="none" stroke="${row.color}" stroke-width="34" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${start}" transform="rotate(-90 ${mid} ${mid})"><title>${esc(row.label)}: ${row.value}</title></circle>`;
  }).join('');
  const centre = `<circle cx="${mid}" cy="${mid}" r="${radius}" fill="none" stroke="#efe9dd" stroke-width="34" />`;
  const hole = `<circle cx="${mid}" cy="${mid}" r="52" fill="#fffdf8" />`;
  const label = `<text x="${mid}" y="${mid - 2}" text-anchor="middle" font-size="13" font-weight="700" fill="#1f2937">${esc(opts.centre ?? '')}</text>`;
  const sub = `<text x="${mid}" y="${mid + 16}" text-anchor="middle" font-size="11" fill="#6b7280">${esc(opts.centreSub ?? '')}</text>`;
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Donut chart" class="donut">${centre}${slices}${hole}${label}${sub}</svg>`;
}

// Horizontal bars. rows: [{label, value, color, display}].
export function hbars(rows, opts = {}) {
  const width = opts.width ?? 640;
  const rowHeight = opts.rowH ?? 30;
  const labelWidth = opts.labelW ?? 190;
  const height = rows.length * rowHeight + 8;
  const biggest = Math.max(1, ...rows.map((row) => row.value));
  const track = width - labelWidth - 90;
  let body = '';
  rows.forEach((row, i) => {
    const y = 6 + i * rowHeight;
    const barWidth = Math.max(2, (track * row.value) / biggest);
    body += `<text x="0" y="${y + 15}" font-size="12" fill="#1f2937">${esc(row.label)}</text>`;
    body += `<rect x="${labelWidth}" y="${y + 4}" width="${barWidth.toFixed(1)}" height="16" rx="3" fill="${row.color}"><title>${esc(row.label)}: ${row.display ?? row.value}</title></rect>`;
    body += `<text x="${(labelWidth + barWidth + 6).toFixed(1)}" y="${y + 16}" font-size="12" fill="#1f2937">${esc(row.display ?? row.value)}</text>`;
  });
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Horizontal bar chart" class="chart">${body}</svg>`;
}

// Grouped vertical bars: two series over the same month labels.
export function groupedBars(labels, first, second, opts = {}) {
  const width = opts.width ?? 640;
  const height = opts.height ?? 240;
  const pad = { top: 16, right: 10, bottom: 30, left: 40 };
  const top = Math.max(1, ...first, ...second);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const groupW = innerW / labels.length;
  let bars = '';
  labels.forEach((label, i) => {
    const x = pad.left + i * groupW;
    const h1 = (first[i] / top) * innerH;
    const h2 = (second[i] / top) * innerH;
    bars += `<rect x="${(x + groupW * 0.14).toFixed(1)}" y="${(pad.top + innerH - h1).toFixed(1)}" width="${(groupW * 0.3).toFixed(1)}" height="${h1.toFixed(1)}" rx="2" fill="#0f766e"><title>${esc(label)} income: ${first[i]}</title></rect>`;
    bars += `<rect x="${(x + groupW * 0.52).toFixed(1)}" y="${(pad.top + innerH - h2).toFixed(1)}" width="${(groupW * 0.3).toFixed(1)}" height="${h2.toFixed(1)}" rx="2" fill="#d97706"><title>${esc(label)} spent: ${second[i]}</title></rect>`;
    bars += `<text x="${(x + groupW / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="11" fill="#6b7280">${esc(label)}</text>`;
  });
  const grid = [0, 0.5, 1].map((f) => {
    const y = pad.top + innerH * f;
    return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#efe9dd" stroke-width="1" /><text x="${pad.left - 5}" y="${y + 3}" text-anchor="end" font-size="10" fill="#6b7280">${(top * (1 - f)).toFixed(1)}</text>`;
  }).join('');
  const legend = `<g font-size="12" fill="#1f2937"><rect x="${pad.left}" y="0" width="11" height="11" rx="2" fill="#0f766e" /><text x="${pad.left + 16}" y="10">Income</text><rect x="${pad.left + 90}" y="0" width="11" height="11" rx="2" fill="#d97706" /><text x="${pad.left + 106}" y="10">Spent</text></g>`;
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Grouped bar chart" class="chart">${legend}${grid}${bars}</svg>`;
}
