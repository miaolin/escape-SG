// Back up every stored promotion from the live site into archive/ so the history also lives in git.
//   node scripts/backup-archive.mjs
//   SITE_URL=http://localhost:3000 OUT_DIR=/tmp/archive-test node scripts/backup-archive.mjs
// Writes archive/<YYYY-MM>.json for each month plus archive/index.json. Never deletes files, and exits
// with an error (writing nothing) if the site can't be read, so a bad run can't wipe the backup.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const SITE = (process.env.SITE_URL || 'https://escape-sg.vercel.app').replace(/\/$/, '');
const OUT = process.env.OUT_DIR || fileURLToPath(new URL('../archive', import.meta.url));

async function get(path) {
  const res = await fetch(SITE + path, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

const { index } = await get('/api/promos');
if (!index?.promos?.length) throw new Error('The site returned no stored promotions; nothing backed up');

// fetch everything first, so a failure part-way leaves the existing backup untouched
const promos = [];
for (const { id } of index.promos) {
  const { promo } = await get(`/api/promos?id=${encodeURIComponent(id)}`);
  if (!promo?.routes?.length) throw new Error(`Promotion ${id} came back empty`);
  promos.push(promo);
}

mkdirSync(OUT, { recursive: true });
const changed = [];
const write = (file, data) => {
  const path = join(OUT, file);
  const text = JSON.stringify(data, null, 2) + '\n';
  if (existsSync(path) && readFileSync(path, 'utf8') === text) return;
  writeFileSync(path, text);
  changed.push(file);
};
for (const { id, meta, routes, hash } of promos) write(`${id}.json`, { id, meta, routes, hash });
// leave out lastChecked/lastStatus so the index only changes when the data does
write('index.json', { current: index.current, promos: index.promos.map(({ updatedAt, ...p }) => p) });

console.log(changed.length ? `Updated: ${changed.join(', ')}` : 'No changes');
