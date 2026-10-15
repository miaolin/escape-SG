// Check singaporeair.com for the latest Spontaneous Escapes promotion and store it.
//   POST /api/check          → the site's "Check for updates" button
//   GET  /api/check          → Vercel Cron (daily; needs the CRON_SECRET bearer token when that env var is set)
//   GET  /api/check?dry=1    → fetch and parse only, nothing stored (diagnostics)
// A new travel month becomes the current promotion and the previous one stays in the archive.
// If the current month's tables change (e.g. new blackout dates), the stored copy is updated.
import { fetchPage, parsePage, fingerprint } from '../lib/sia.js';
import { storeConfigured, readIndex, writeIndex, readPromo, writePromo } from '../lib/store.js';

const MIN_INTERVAL_MS = 5 * 60 * 1000; // button presses within 5 minutes reuse the last result

const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

async function fetchLatest() {
  const promo = parsePage(await fetchPage());
  promo.hash = await fingerprint(promo);
  return promo;
}

export async function GET(request) {
  const url = new URL(request.url);
  if (url.searchParams.get('dry')) {
    try {
      const p = await fetchLatest();
      return json({ status: 'parsed', id: p.id, meta: p.meta, routeCount: p.routes.length, hash: p.hash, warnings: p.warnings });
    } catch (e) {
      return json({ status: 'error', error: e.message }, 502);
    }
  }
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, 401);
  return check({ force: true });
}

export async function POST() {
  return check({ force: false });
}

async function check({ force }) {
  if (!storeConfigured()) return json({ status: 'error', error: 'Storage is not configured' }, 503);
  const index = await readIndex();
  const now = new Date();

  if (!force && index.lastChecked && now - new Date(index.lastChecked) < MIN_INTERVAL_MS && index.lastStatus !== 'error') {
    return json({ status: 'recent', index });
  }

  let latest;
  try {
    latest = await fetchLatest();
  } catch (e) {
    Object.assign(index, { lastChecked: now.toISOString(), lastStatus: 'error', lastError: e.message });
    await writeIndex(index);
    return json({ status: 'error', error: e.message, index }, 502);
  }

  const entry = {
    id: latest.id,
    bookFrom: latest.meta.bookFrom,
    bookBy: latest.meta.bookBy,
    travelFrom: latest.meta.travelFrom,
    travelTo: latest.meta.travelTo,
    routeCount: latest.routes.length,
    hash: latest.hash,
    updatedAt: now.toISOString(),
  };
  const existing = index.promos.find((p) => p.id === latest.id);
  let status;
  if (!existing) {
    status = index.current ? 'new' : 'added';
    index.promos.push(entry);
  } else if (existing.hash !== latest.hash) {
    status = 'updated';
    Object.assign(existing, entry);
  } else {
    status = 'unchanged';
  }
  if (status !== 'unchanged') await writePromo(latest);

  index.promos.sort((a, b) => b.id.localeCompare(a.id));
  index.current = index.promos[0].id;
  Object.assign(index, { lastChecked: now.toISOString(), lastStatus: status, lastError: null });
  await writeIndex(index);

  const promo = latest.id === index.current ? latest : await readPromo(index.current);
  return json({ status, index, promo, warnings: latest.warnings });
}
