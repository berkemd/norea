// Daylume golden hour calculator — runs entirely in the browser. No location
// permission, no network, no storage. Same thresholds as the Daylume app:
// blue hour −6°…−4°, golden hour −4°…+6°, sunrise/sunset at −0.833°.
const RAD = Math.PI / 180;

// Solar altitude (degrees) for a UTC instant (ms) at lat/lon (degrees, east +).
// NOAA / Meeus low-precision formulas, accurate to well under a minute.
export function solarAltitude(ms, lat, lon) {
  const jd = ms / 86400000 + 2440587.5;
  const t = (jd - 2451545) / 36525;
  const L0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const C = Math.sin(M * RAD) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * t) + Math.sin(3 * M * RAD) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * t;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD));
  const y = Math.tan((eps / 2) * RAD) ** 2;
  const eqTime = 4 / RAD * (y * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD) +
    4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) -
    0.5 * y * y * Math.sin(4 * L0 * RAD) - 1.25 * e * e * Math.sin(2 * M * RAD));
  const d = new Date(ms);
  const utcMin = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
  const tst = (utcMin + eqTime + 4 * lon + 1440) % 1440;
  const ha = (tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180) * RAD;
  const cosZ = Math.sin(lat * RAD) * Math.sin(decl) + Math.cos(lat * RAD) * Math.cos(decl) * Math.cos(ha);
  return 90 - Math.acos(Math.max(-1, Math.min(1, cosZ))) / RAD;
}

// All crossings of `deg` in [startMs, endMs): minute scan, then bisection to ~1 s.
function crossings(startMs, endMs, lat, lon, deg) {
  const out = [];
  let prevT = startMs, prev = solarAltitude(prevT, lat, lon) - deg;
  for (let t = startMs + 60000; t <= endMs; t += 60000) {
    const cur = solarAltitude(t, lat, lon) - deg;
    if ((prev < 0) !== (cur < 0)) {
      let a = prevT, b = t;
      for (let i = 0; i < 12; i++) {
        const m = (a + b) / 2;
        if ((solarAltitude(m, lat, lon) - deg < 0) === (prev < 0)) a = m; else b = m;
      }
      out.push({ ms: (a + b) / 2, rising: cur > prev });
    }
    prevT = t; prev = cur;
  }
  return out;
}

// Local-day window [start, end) in UTC ms for a calendar date in an IANA zone.
export function dayWindow(y, m, d, tz) {
  const guess = Date.UTC(y, m - 1, d, 12);
  const off = (ms) => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(ms));
    const g = (k) => +p.find((x) => x.type === k).value;
    return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')) - ms;
  };
  const start = Date.UTC(y, m - 1, d) - off(guess);
  const end = Date.UTC(y, m - 1, d + 1) - off(guess + 86400000);
  return [start, end];
}

export function lightTimes(y, m, d, lat, lon, tz) {
  const [s, e] = dayWindow(y, m, d, tz);
  const pick = (deg, rising) => {
    const c = crossings(s, e, lat, lon, deg).filter((x) => x.rising === rising);
    return c.length ? c[0].ms : null;
  };
  return {
    blueMorningStart: pick(-6, true), goldenMorningStart: pick(-4, true), sunrise: pick(-0.833, true),
    goldenMorningEnd: pick(6, true), goldenEveningStart: pick(6, false), sunset: pick(-0.833, false),
    goldenEveningEnd: pick(-4, false), blueEveningEnd: pick(-6, false),
  };
}
