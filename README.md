# escape-SG

Unofficial bilingual (中文 / English) guide to the Singapore Airlines
[KrisFlyer Spontaneous Escapes](https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/krisflyer-spontaneous-escapes/)
deals. Live at https://escape-sg.vercel.app

## Layout

- `vercel-deploy/` — the static site (no build step) and the folder deployed to Vercel
  - `index.html`, `styles.css`, `app.js` — page, styles, rendering and zh/en text
  - `data.js` — route data parsed from the official page

## Run locally

```sh
python3 -m http.server 8000 --directory vercel-deploy
```

## Deploy

```sh
cd vercel-deploy
vercel --prod
```
