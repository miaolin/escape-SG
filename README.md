# escape-SG

An unofficial, bilingual (中文 / English) guide to the Singapore Airlines
[KrisFlyer Spontaneous Escapes](https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/krisflyer-spontaneous-escapes/)
promotion: 30% off Saver award flights booked by **31 Oct 2026** for travel **1–30 Nov 2026**.

**Live site:** https://escape-sg.vercel.app
(direct links: [中文](https://escape-sg.vercel.app/?lang=zh) · [English](https://escape-sg.vercel.app/?lang=en))

Current version: see [`VERSION`](VERSION). Release notes: [`CHANGELOG.md`](CHANGELOG.md).

## What the site shows

- **Overview:** promotion dates with a booking countdown, and one card per region
  (South East Asia, North Asia, West Asia & Africa, Southwest Pacific, Europe, USA)
  with its route count and mileage range per cabin.
- **Region tables:** one row per route (e.g. Singapore SIN → Istanbul IST), with
  miles, flight numbers and blackout dates for Economy, Premium Economy and Business.
  "—" means no blackout dates, or no deal in that cabin.
- **Booking notes:** the main terms in plain language (online only, no changes or
  refunds, every leg must be a listed flight in November, taxes extra).
- **Language switch:** 中文 / EN in the header. The first language comes from the
  `?lang=zh|en` link, then the visitor's last choice, then the browser language.

## Project layout

```
escape-SG/
├── README.md
├── CHANGELOG.md
├── VERSION
└── vercel-deploy/        # the static site; this folder is what gets deployed
    ├── index.html        # page skeleton
    ├── styles.css        # styles
    ├── app.js            # rendering, city/region names, zh/en text
    └── data.js           # route data (window.PROMO)
```

There is no build step and no dependencies; the page loads fonts from Google Fonts.

## Run locally

```sh
python3 -m http.server 8000 --directory vercel-deploy
```

Then open http://127.0.0.1:8000.

## Deploy

The Vercel project (`oaimnils-projects/escape-sg`) is linked from inside
`vercel-deploy/` (the `.vercel/` folder there is git-ignored).

```sh
cd vercel-deploy
vercel --prod
```

Vercel is not connected to the GitHub repo, so pushing does **not** redeploy.

## Data

`vercel-deploy/data.js` holds every deal from the official page as of **15 Oct 2026**:

```js
{ region, origin, dest, cabin, miles, flights: ["SQ714"], blackout: [4, 5, 6] }
```

- `miles` is per person, one-way, after the discount, excluding taxes.
- `blackout` lists the November 2026 days the deal doesn't apply.
- Chinese city names and airport codes live in `app.js` (`CITY`). Phnom Penh uses
  **KTI** and Siem Reap **SAI**, the cities' new airports.

The data does not update itself. If Singapore Airlines changes routes or blackout
dates, re-copy the tables from the official page into `data.js`, then bump
`VERSION` and add a `CHANGELOG.md` entry.

## Disclaimer

Not affiliated with Singapore Airlines. Seats, blackout dates and terms can change
at any time; always check the official page before booking.
