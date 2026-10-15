# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/).

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

[0.3.1]: https://github.com/miaolin/escape-SG/compare/9486e5f...main
[0.3.0]: https://github.com/miaolin/escape-SG/compare/617bb0c...9486e5f
[0.2.0]: https://github.com/miaolin/escape-SG/compare/daec647...617bb0c
[0.1.0]: https://github.com/miaolin/escape-SG/commit/daec647
