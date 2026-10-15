# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/).

## [0.5.0] - 2026-10-15

### Added
- Region cards work as tabs: clicking a card shows that region's table directly below it,
  and the selected card is highlighted with a "↓ Shown below / 下方显示" label.
  Left/right arrow keys move between cards.
- Daily GitHub backup (`.github/workflows/archive-backup.yml` + `scripts/backup-archive.mjs`):
  every stored month is copied from the live site into `archive/<YYYY-MM>.json` in the repo,
  committed only when something changed, so the history survives even if the Vercel storage is lost.
- Download the month being viewed (current or archived) as CSV or JSON from the header bar.
  The CSV has one row per deal, uses the page language for headers and city names (with
  airport codes), and opens with Chinese intact in Excel; the JSON is the stored data as is.
- Links like `#eu` or `#usa` open a region directly; the address updates when a card is
  chosen, so it can be shared.

### Changed
- Region tables are shown one at a time, for the selected card, instead of all stacked on the page.
- The link under each table now reads "↑ Choose another region" and returns to the cards.
- Header reorganised: the dark header is its own card, separate from the overview, and holds
  the title and a bar with the month picker and check button (with its status). The promotion dates/discount and the route, region and
  cabin counts moved into two light bars directly above the region cards, and the counts
  are plain text instead of button-like chips.
- The promotion bar is now a filled navy bar with the discount as a gold badge; the
  days-left counter turns red in the last 3 days and grey once booking has closed. The stats
  bar has a light blue tint with the numbers in bold.
- New region colours, one theme per region at a matching depth: jade (South East Asia),
  sakura pink (North Asia), desert amber (West Asia & Africa), ocean blue (Southwest Pacific),
  royal indigo (Europe) and crimson (USA). Cards have a gradient band across the top.
- The English check button is renamed from "Check singaporeair.com" to "Check promotion".
- The "Blackout dates" chip is now a "Blackout dates by region ↓" link in the stats line.

## [0.4.0] - 2026-10-15

### Added
- "Check singaporeair.com / 检查官网更新" button. It fetches the official page, and if a new
  month's promotion is there it becomes the current one and the previous month is archived.
  Changes to the current month (e.g. new blackout dates) are synced.
- Daily automatic check at 09:00 Singapore time (Vercel Cron).
- Month picker and archive view for past promotions, with an "archived" banner
  (`?promo=YYYY-MM` links straight to one).
- `/api/check` and `/api/promos` Vercel functions; promotions are stored in Vercel Blob.
- Parser (`lib/sia.js`) that reads the official tables for any month, including blackout
  ranges that cross months or years.
- `scripts/build-seed.mjs` to regenerate the built-in fallback data.
- Chinese names and airport codes for more Singapore Airlines destinations.

### Changed
- Dates, discount and booking notes now come from the data instead of being fixed to November 2026.
- `data.js` is now only the fallback used when the API isn't available.

## [0.3.2] - 2026-10-15

### Removed
- The promotion info bar under each region table header (dates, discount and
  "per person, one-way" note). The miles note is still in the overview legend.

## [0.3.1] - 2026-10-15

### Added
- `README.md` describing the project, data and workflow.
- `CHANGELOG.md` and `VERSION` file.

### Changed
- Moved the site into `vercel-deploy/`, which is now the folder deployed to Vercel.

## [0.3.0] - 2026-10-15

### Added
- 中文 / EN language switch. The first language shown comes from the `?lang=` link,
  then the visitor's last choice, then the browser language.
- English city names (e.g. "Bali (Denpasar)", "London Heathrow") and English
  blackout date format ("4, 7–9 Nov").

## [0.2.0] - 2026-10-15

### Changed
- Redesigned the site in Chinese: region overview cards with mileage ranges, then one
  table per region listing miles, flight numbers and blackout dates for each cabin.
- Premium Economy shown as its own column group where a route offers it.
- Booking rules rewritten as a Chinese 预订须知 section.

### Removed
- English flight finder (search, filters, date picker) and round-trip planner.

## [0.1.0] - 2026-10-15

### Added
- First version: English flight finder for the November 2026 Spontaneous Escapes deals,
  with search, cabin/direction/region filters, a travel-date picker, blackout strips
  per deal, a round-trip planner, and a plain-language summary of the terms.
- Route data (`data.js`) parsed from the official Singapore Airlines page as of 15 Oct 2026.
- Deployed to Vercel at https://escape-sg.vercel.app.

[0.5.0]: https://github.com/miaolin/escape-SG/compare/048d9f5...main
[0.4.0]: https://github.com/miaolin/escape-SG/compare/76fab13...048d9f5
[0.3.2]: https://github.com/miaolin/escape-SG/compare/290f5f0...76fab13
[0.3.1]: https://github.com/miaolin/escape-SG/compare/9486e5f...290f5f0
[0.3.0]: https://github.com/miaolin/escape-SG/compare/617bb0c...9486e5f
[0.2.0]: https://github.com/miaolin/escape-SG/compare/daec647...617bb0c
[0.1.0]: https://github.com/miaolin/escape-SG/commit/daec647
