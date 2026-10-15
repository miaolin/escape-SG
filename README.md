# escape-SG

An unofficial, bilingual (中文 / English) guide to the Singapore Airlines
[KrisFlyer Spontaneous Escapes](https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/krisflyer-spontaneous-escapes/)
promotion: a monthly set of discounted Saver award flights. The site keeps up with each
new month and archives the previous ones.

**Live site:** https://escape-sg.vercel.app
(direct links: [中文](https://escape-sg.vercel.app/?lang=zh) · [English](https://escape-sg.vercel.app/?lang=en))

Current version: see [`VERSION`](VERSION). Release notes: [`CHANGELOG.md`](CHANGELOG.md).

## What the site shows

- **Overview:** booking and travel dates with a countdown, and one card per region
  with its route count and mileage range per cabin.
- **Region tabs:** one tab per region, showing one table at a time. The tab row stays
  visible while scrolling, arrow keys switch tabs, and the overview cards open their tab.
  Links like `#eu` or `#usa` open a region directly (e.g. https://escape-sg.vercel.app/#eu).
- **Region tables:** one row per route (e.g. Singapore SIN → Istanbul IST), with miles,
  flight numbers and blackout dates for each cabin.
  "—" means no blackout dates, or no deal in that cabin.
- **Booking notes:** the main terms in plain language.
- **Language switch:** 中文 / EN. The first language comes from the `?lang=zh|en` link,
  then the visitor's last choice, then the browser language.
- **Month picker and archive:** past months stay viewable, marked as archived.
  `?promo=YYYY-MM` links straight to one.
- **Check for updates:** the "检查官网更新 / Check promotion" button.

## How updates work

```
button (POST) ─┐
               ├─▶ /api/check ─▶ fetch singaporeair.com ─▶ parse tables ─▶ Vercel Blob
daily cron ────┘                                                            │
page ◀─────────────────────────── /api/promos ◀─────────────────────────────┘
```

- `/api/check` fetches the official page and parses it (`lib/sia.js`). The promotion's id
  is its travel month (`YYYY-MM`).
  - **New month:** stored and becomes current; the previous month stays in the archive.
  - **Same month, different content** (e.g. new blackout dates): the stored copy is updated.
  - **No change:** nothing is written.
  - **Fetch or parse failure:** nothing is overwritten; the error is recorded and shown.
- Button presses within 5 minutes of the last check reuse its result instead of fetching again.
- Vercel Cron calls `GET /api/check` daily at 01:00 UTC (09:00 Singapore time). In
  production that call needs the `CRON_SECRET` bearer token, which Vercel sends automatically.
- `GET /api/check?dry=1` fetches and parses without storing anything, for diagnostics.
- `/api/promos` returns `{ index, promo }` for the current month, or `?id=YYYY-MM` for an archived one.
- If the API isn't reachable (e.g. a plain static server), the page falls back to the
  built-in `data.js`.

### Storage (Vercel Blob store `escape-sg-data`)

```
index.json            { current, promos: [{ id, bookBy, travelFrom, travelTo, routeCount, hash, updatedAt }],
                        lastChecked, lastStatus, lastError }
promos/<YYYY-MM>.json { id, meta, routes, hash }
```

### Environment variables

| Name | Where | Purpose |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | all environments (set by Vercel when the store was connected) | read/write the Blob store |
| `CRON_SECRET` | production | protects the cron path of `/api/check` |
| `BLOB_PREFIX` | optional, local testing | key prefix (e.g. `test/`) so tests don't touch live data |

## Project layout

```
escape-SG/
├── README.md
├── CHANGELOG.md
├── VERSION
├── scripts/
│   └── build-seed.mjs     # regenerate vercel-deploy/data.js from the official page
└── vercel-deploy/         # deployed to Vercel
    ├── index.html         # page skeleton
    ├── styles.css
    ├── app.js             # rendering, region tabs, zh/en text, city/region names, archive + check UI
    ├── data.js            # built-in fallback data (window.PROMO_SEED)
    ├── api/
    │   ├── check.js       # fetch, parse, store
    │   └── promos.js      # serve stored promotions
    ├── lib/
    │   ├── sia.js         # fetch + parse the official page
    │   └── store.js       # Vercel Blob read/write
    ├── vercel.json        # daily cron
    └── package.json       # @vercel/blob
```

## Run locally

Full site with the API (uses the Blob token in `vercel-deploy/.env.local`, from `vercel env pull`):

```sh
cd vercel-deploy
npm install
BLOB_PREFIX=test/ vercel dev    # BLOB_PREFIX keeps local tests out of the live data
```

Static preview only (no update button; shows `data.js`):

```sh
python3 -m http.server 8000 --directory vercel-deploy
```

## Deploy

```sh
cd vercel-deploy
vercel --prod
```

Vercel is not connected to the GitHub repo, so pushing does **not** redeploy.

## Data notes

Each deal looks like:

```js
{ region, origin, dest, cabin, miles, flights: ["SQ714"],
  blackout: ["2026-11-04", "2026-11-05"], blackoutRaw: "4-5 November 2026" }
```

- `miles` is per person, one-way, after the discount, excluding taxes.
- If a blackout text can't be parsed, the page shows `blackoutRaw` as written.
- Chinese city names and airport codes live in `app.js` (`CITY`). A city missing from that
  list is shown with its English name only. Phnom Penh uses **KTI** and Siem Reap **SAI**,
  the cities' new airports.
- The parser relies on the official page's table layout ("MILES REQUIRED FOR … CLASS",
  "FLIGHT NO.", "BLACKOUT PERIOD") and the terms' "issued between … for travel from …"
  sentence. If Singapore Airlines redesigns the page, checks will report an error rather
  than store bad data, and `lib/sia.js` will need updating.

## Disclaimer

Not affiliated with Singapore Airlines. Seats, blackout dates and terms can change
at any time; always check the official page before booking.
