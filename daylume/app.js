import { lightTimes } from './golden-hour.js';
import { CITIES } from './cities.js';
const $ = (id) => document.getElementById(id);
const sel = $('city'), date = $('date'), out = $('out');
CITIES.slice().sort((a, b) => a[0].localeCompare(b[0])).forEach(([n]) => sel.add(new Option(n, n)));
let tzNow = 'UTC';
try { tzNow = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch {}
const q = new URLSearchParams(location.search).get('city');
const pick = CITIES.find((c) => c[0] === q) || CITIES.find((c) => c[3] === tzNow) || CITIES.find((c) => c[0] === 'New York');
sel.value = pick[0];
const today = (tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
date.value = today(pick[3]);
const fmt = (ms, tz) => ms == null ? '—' : new Intl.DateTimeFormat(undefined, { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(ms);
const dur = (a, b) => (a == null || b == null) ? '' : ` (${Math.round((b - a) / 60000)} min)`;
function render() {
  const c = CITIES.find((x) => x[0] === sel.value); if (!c) return;
  const [y, m, d] = date.value.split('-').map(Number); if (!y) return;
  const [, lat, lon, tz] = c; const r = lightTimes(y, m, d, lat, lon, tz);
  const lowAllDay = r.goldenMorningEnd == null && r.goldenEveningStart == null && r.goldenMorningStart != null && r.goldenEveningEnd != null;
  const rows = lowAllDay ? [
    ['Morning blue hour', `${fmt(r.blueMorningStart, tz)} – ${fmt(r.goldenMorningStart, tz)}`, dur(r.blueMorningStart, r.goldenMorningStart)],
    ['Golden light (Sun stays low all day)', `${fmt(r.goldenMorningStart, tz)} – ${fmt(r.goldenEveningEnd, tz)}`, dur(r.goldenMorningStart, r.goldenEveningEnd)],
    ['Evening blue hour', `${fmt(r.goldenEveningEnd, tz)} – ${fmt(r.blueEveningEnd, tz)}`, dur(r.goldenEveningEnd, r.blueEveningEnd)],
  ] : [
    ['Morning blue hour', `${fmt(r.blueMorningStart, tz)} – ${fmt(r.goldenMorningStart, tz)}`, dur(r.blueMorningStart, r.goldenMorningStart)],
    ['Morning golden hour', `${fmt(r.goldenMorningStart, tz)} – ${fmt(r.goldenMorningEnd, tz)}`, dur(r.goldenMorningStart, r.goldenMorningEnd)],
    ['Sunrise', fmt(r.sunrise, tz), ''],
    ['Sunset', fmt(r.sunset, tz), ''],
    ['Evening golden hour', `${fmt(r.goldenEveningStart, tz)} – ${fmt(r.goldenEveningEnd, tz)}`, dur(r.goldenEveningStart, r.goldenEveningEnd)],
    ['Evening blue hour', `${fmt(r.goldenEveningEnd, tz)} – ${fmt(r.blueEveningEnd, tz)}`, dur(r.goldenEveningEnd, r.blueEveningEnd)],
  ];
  out.replaceChildren(...rows.map(([k, v, x]) => { const tr = document.createElement('tr'); tr.innerHTML = `<th scope="row"></th><td></td>`; tr.children[0].textContent = k; tr.children[1].textContent = v + x; return tr; }));
  $('where').textContent = `${c[0]} · ${date.value} · times in ${tz.replace(/_/g, ' ')}`;
  $('note').hidden = !(r.sunrise == null || r.sunset == null);
  try { history.replaceState(null, '', `?city=${encodeURIComponent(c[0])}`); } catch {}
}
sel.addEventListener('change', () => { const c = CITIES.find((x) => x[0] === sel.value); date.value = today(c[3]); render(); });
date.addEventListener('change', render);
$('calc').hidden = false; render();
