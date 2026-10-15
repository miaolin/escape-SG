// GET /api/promos           → { index, promo } for the current promotion
// GET /api/promos?id=YYYY-MM → { index, promo } for an archived promotion
import { storeConfigured, readIndex, readPromo } from '../lib/store.js';

export async function GET(request) {
  if (!storeConfigured()) return Response.json({ error: 'Storage is not configured' }, { status: 503 });
  const index = await readIndex();
  const id = new URL(request.url).searchParams.get('id') || index.current;
  if (!id) return Response.json({ index, promo: null }, { headers: { 'Cache-Control': 'no-store' } });
  if (!index.promos.some((p) => p.id === id)) return Response.json({ error: `No promotion ${id}`, index }, { status: 404 });
  const promo = await readPromo(id);
  return Response.json({ index, promo }, { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=300' } });
}
