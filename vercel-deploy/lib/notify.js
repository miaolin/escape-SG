// Email the site owner when the stored promotion changes, through Resend's HTTP API.
// Needs RESEND_API_KEY and NOTIFY_EMAIL; without them this does nothing.
import { SOURCE_URL } from './sia.js';

const SITE_URL = 'https://escape-sg.vercel.app';
const FROM = 'Spontaneous Escapes <onboarding@resend.dev>'; // Resend's shared sender: delivers only to the account's own address

const longDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const travelMonth = (iso) => new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function buildEmail(status, { meta, routes }) {
  const month = travelMonth(meta.travelFrom);
  const subject = status === 'updated'
    ? `Spontaneous Escapes ${month} has changed`
    : `New Spontaneous Escapes: ${month}, book by ${longDate(meta.bookBy)}`;
  const text = [
    status === 'updated'
      ? `The official ${month} promotion page has changed, for example its blackout dates or routes.`
      : `The ${month} promotion is out.`,
    '',
    `Book: ${longDate(meta.bookFrom)} to ${longDate(meta.bookBy)}`,
    `Travel: ${longDate(meta.travelFrom)} to ${longDate(meta.travelTo)}`,
    ...(meta.discountPct ? [`Discount: ${meta.discountPct}% off Saver awards`] : []),
    `Deals: ${routes.length}`,
    '',
    `See the deals: ${SITE_URL}`,
    `Official page: ${SOURCE_URL}`,
  ].join('\n');
  return { subject, text };
}

// Returns false only if an email should have gone out but didn't, so the caller can retry on the next check.
export async function notifyChange(status, promo) {
  const { RESEND_API_KEY: key, NOTIFY_EMAIL: to } = process.env;
  if (!key || !to) return true;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], ...buildEmail(status, promo) }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) return true;
    console.error(`Notification email failed: HTTP ${res.status} ${await res.text()}`);
  } catch (e) {
    console.error(`Notification email failed: ${e.message}`);
  }
  return false;
}
