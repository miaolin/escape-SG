// Promotion storage in Vercel Blob.
//   index.json          → { current, promos: [{ id, bookFrom, bookBy, travelFrom, travelTo, routeCount, hash, updatedAt }], lastChecked, lastStatus, lastError }
//   promos/<YYYY-MM>.json → { id, meta, routes, hash }
// The newest travel month is "current"; every other entry is the archive.
import { put, head, BlobNotFoundError } from '@vercel/blob';

export const storeConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
// Optional key prefix, e.g. BLOB_PREFIX=test/ to keep test runs away from the live data.
const prefix = () => process.env.BLOB_PREFIX || '';

async function readJSON(pathname) {
  try {
    const { url } = await head(prefix() + pathname);
    const res = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Blob read failed: HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

const writeJSON = (pathname, data) => put(prefix() + pathname, JSON.stringify(data), {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
  cacheControlMaxAge: 60,
});

export const emptyIndex = () => ({ current: null, promos: [], lastChecked: null, lastStatus: null, lastError: null });
export const readIndex = async () => (await readJSON('index.json')) || emptyIndex();
export const writeIndex = (index) => writeJSON('index.json', index);
export const readPromo = (id) => readJSON(`promos/${id}.json`);
export const writePromo = (promo) => writeJSON(`promos/${promo.id}.json`, promo);
