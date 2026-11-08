// Email the site owner when the stored promotion changes, or when checks keep failing, through Resend's HTTP API.
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

export function buildFailureEmail(since, error) {
  const blocked = /HTTP 403/.test(error);
  return {
    subject: 'Spontaneous Escapes: the update check keeps failing',
    text: [
      `The check of the official page has failed on every attempt since ${new Date(since).toUTCString()}, so new deals won't be picked up.`,
      '',
      `Last error: ${error}`,
      '',
      blocked
        ? 'HTTP 403 means singaporeair.com is refusing the site\'s requests. A fresh production deploy usually gets through: run `vercel --prod` in vercel-deploy, then check the link below shows "pending" or "parsed".'
        : 'The page may have changed. The link below shows every problem found.',
      '',
      `Diagnose: ${SITE_URL}/api/check?dry=1`,
      '',
      'You will get this once per failing streak; it resets after a successful check.',
    ].join('\n'),
  };
}

// Returns false only if an email should have gone out but didn't, so the caller can retry on the next check.
export const notifyChange = (status, promo) => send(buildEmail(status, promo));
export const notifyFailure = (since, error) => send(buildFailureEmail(since, error));

async function send(email) {
  const { RESEND_API_KEY: key, NOTIFY_EMAIL: to } = process.env;
  if (!key || !to) return true;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], ...email }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) return true;
    console.error(`Notification email failed: HTTP ${res.status} ${await res.text()}`);
  } catch (e) {
    console.error(`Notification email failed: ${e.message}`);
  }
  return false;
}
