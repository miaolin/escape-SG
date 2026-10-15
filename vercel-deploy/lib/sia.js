// Fetch and parse the KrisFlyer Spontaneous Escapes page into structured data.
// Shared by the API functions (api/*.js) and the local seed script (scripts/build-seed.mjs).

export const SOURCE_URL = 'https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/krisflyer-spontaneous-escapes/';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_RE = MONTHS.join('|');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—' };
const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z0-9#]+);/gi, (m, k) => ENTITIES[k.toLowerCase()] ?? m);
const text = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/[\s ​]+/g, ' ').trim();
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

export async function fetchPage(url = SOURCE_URL) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-GB,en;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`singaporeair.com returned HTTP ${res.status}`);
  return res.text();
}

// "15 October 2026" → "2026-10-15"
function parseDate(s) {
  const m = new RegExp(`(\\d{1,2})\\s+(${MONTH_RE})\\s+(\\d{4})`, 'i').exec(s);
  return m ? iso(+m[3], MONTHS.indexOf(m[2].toLowerCase()) + 1, +m[1]) : null;
}

// "5-8 November, 12 November, 30 November - 2 December 2026" → ISO dates.
// Parts without a month inherit the next month named; parts without a year use the last year named (or travel year).
export function parseBlackout(raw, fallbackYear, fallbackMonth) {
  const s = raw.trim();
  if (!s || /^[-–—]$/.test(s)) return { dates: [], ok: true };
  const years = [...s.matchAll(/\b(\d{4})\b/g)].map((m) => +m[1]);
  const year = years.length ? Math.min(...years) : fallbackYear;
  const parts = s.replace(/\d{4}\s*$/, '').split(/[,;&]|\band\b/i).map((p) => p.trim()).filter(Boolean);
  const parsed = [];
  let ok = true;
  const re = new RegExp(`^(\\d{1,2})\\s*(${MONTH_RE})?(?:\\s*\\d{4})?\\s*(?:[-–—]|to)?\\s*(?:(\\d{1,2})\\s*(${MONTH_RE})?)?$`, 'i');
  for (const p of parts) {
    const m = re.exec(p);
    if (!m) { ok = false; continue; }
    parsed.push({ d1: +m[1], m1: m[2], d2: m[3] ? +m[3] : null, m2: m[4] });
  }
  // fill missing months from the right (e.g. "5-8 November" → both ends November; "4" then "7-9 November")
  let next = fallbackMonth;
  for (let i = parsed.length - 1; i >= 0; i--) {
    const p = parsed[i];
    const end = p.m2 || p.m1 || null;
    if (end) next = MONTHS.indexOf(end.toLowerCase()) + 1;
    p.mm2 = p.m2 ? MONTHS.indexOf(p.m2.toLowerCase()) + 1 : next;
    p.mm1 = p.m1 ? MONTHS.indexOf(p.m1.toLowerCase()) + 1 : p.mm2;
    next = p.mm1;
  }
  const dates = new Set();
  for (const p of parsed) {
    const start = new Date(Date.UTC(year, p.mm1 - 1, p.d1));
    const end = p.d2 ? new Date(Date.UTC(year, p.mm2 - 1, p.d2)) : start;
    if (end < start) end.setUTCFullYear(end.getUTCFullYear() + 1);
    for (let t = start; t <= end; t = new Date(t.getTime() + 864e5)) {
      dates.add(t.toISOString().slice(0, 10));
    }
  }
  return { dates: [...dates].sort(), ok };
}

const normRegion = (r) => {
  const t = r.replace(/\s+/g, ' ').trim();
  if (/^u\.?s\.?a\.?$/i.test(t)) return 'USA';
  return t;
};

const cabinFromHeader = (h) => {
  const m = /MILES REQUIRED FOR (.+?) CLASS/i.exec(h);
  if (!m) return null;
  const c = m[1].trim().toLowerCase();
  if (c.startsWith('premium')) return 'Premium Economy';
  if (c.startsWith('business')) return 'Business';
  if (c.startsWith('first') || c.startsWith('suite')) return 'First';
  if (c.startsWith('economy')) return 'Economy';
  return m[1].trim();
};

export function parsePage(html, { retrieved = new Date().toISOString() } = {}) {
  const plain = text(html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' '));

  const period = new RegExp(
    `issued between (\\d{1,2} (?:${MONTH_RE}) \\d{4}).{0,60}? and (\\d{1,2} (?:${MONTH_RE}) \\d{4}).{0,120}? for travel from (\\d{1,2} (?:${MONTH_RE}) \\d{4}).{0,60}? to (\\d{1,2} (?:${MONTH_RE}) \\d{4})`, 'i',
  ).exec(plain);
  if (!period) throw new Error('Could not find the booking and travel period on the page');
  const [bookFrom, bookBy, travelFrom, travelTo] = period.slice(1).map(parseDate);
  const discount = /(\d{1,2})%\s*off\s+Saver award/i.exec(plain);
  const scoot = /(\d{1,2})%\s*off Economy Saver award tickets on selected Scoot/i.exec(plain);

  // region headings (<h3> inside rich text, not accordion buttons) and tables, in page order
  const tokens = [];
  const headRe = /<h3(?![^>]*cmp-accordion)[^>]*>([\s\S]*?)<\/h3>/gi;
  for (let m; (m = headRe.exec(html));) tokens.push({ at: m.index, kind: 'h', value: text(m[1]) });
  const tableRe = /<table[\s\S]*?<\/table>/gi;
  for (let m; (m = tableRe.exec(html));) tokens.push({ at: m.index, kind: 't', value: m[0] });
  tokens.sort((a, b) => a.at - b.at);

  const [ty, tm] = travelFrom.split('-').map(Number);
  const routes = [];
  const warnings = [];
  let region = null;
  for (const tok of tokens) {
    if (tok.kind === 'h') { if (tok.value) region = normRegion(tok.value); continue; }
    const headers = [...tok.value.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => text(m[1]));
    if (!headers.some((h) => /MILES REQUIRED/i.test(h))) continue;
    // columns: FROM, then groups of (MILES REQUIRED FOR X, FLIGHT NO., BLACKOUT PERIOD)
    const groups = [];
    headers.forEach((h, i) => { const c = cabinFromHeader(h); if (c) groups.push({ cabin: c, col: i }); });
    const rows = [...tok.value.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => text(c[1])));
    for (const cells of rows) {
      if (!cells.length) continue;
      const rm = /^(.+?)\s+to\s+(.+)$/i.exec(cells[0]);
      if (!rm) { warnings.push(`Unrecognised route "${cells[0]}"`); continue; }
      const [origin, dest] = [rm[1].trim(), rm[2].trim()];
      for (const g of groups) {
        const milesTxt = cells[g.col] || '';
        if (!/\d/.test(milesTxt)) continue;
        const miles = +milesTxt.replace(/[^\d]/g, '');
        const flights = (cells[g.col + 1] || '').split(/[,/&]|\band\b/).map((f) => f.replace(/\s+/g, '').toUpperCase()).filter((f) => /^[A-Z0-9]{2}\d{1,4}$/.test(f));
        const blackoutRaw = (cells[g.col + 2] || '').trim();
        const bo = parseBlackout(blackoutRaw, ty, tm);
        if (!bo.ok) warnings.push(`Partly unparsed blackout "${blackoutRaw}" (${origin} → ${dest}, ${g.cabin})`);
        routes.push({ region: region || 'Other', origin, dest, cabin: g.cabin, miles, flights, blackout: bo.dates, blackoutRaw: blackoutRaw === '-' ? '' : blackoutRaw });
      }
    }
  }
  if (!routes.length) throw new Error('No deal tables found on the page');

  return {
    id: travelFrom.slice(0, 7),
    meta: {
      source: SOURCE_URL,
      retrieved,
      bookFrom, bookBy, travelFrom, travelTo,
      discountPct: discount ? +discount[1] : null,
      scootPct: scoot ? +scoot[1] : null,
    },
    routes,
    warnings,
  };
}

// Stable fingerprint of the deal content, used to tell whether anything changed.
export async function fingerprint(promo) {
  const body = JSON.stringify({ meta: { ...promo.meta, retrieved: undefined }, routes: promo.routes });
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}
