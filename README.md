# MasterGamer Static Website

A modern dark neon static website for MasterGamer, an Australian indie game and app studio.

## Files

- `index.html` - all page sections and markup.
- `styles.css` - responsive dark neon arcade styling.
- `games.js` - editable game library data, descriptions, media paths, store links, online play availability, and trailer paths.
- `news.js` - editable news and updates data used by the homepage and News & Updates page.
- `main.js` - renders game cards, news cards, mobile navigation, expandable panels, and the arcade background canvas.
- `news.html` - dedicated News & Updates page.
- `privacy.html`, `terms.html`, `cookies.html`, `humding-privacy.html`, `data-request.html` - separate legal and privacy request pages.

## Editing Games

Open `games.js` and update the objects in `MASTERGAMER_GAMES`.

Each game includes:

- `title`
- `initials`
- `accent`
- `summary`
- `description`
- `links.appStore`
- `links.googlePlay`
- `links.playOnline`
- `links.trailer`
- `platforms`
- `featured`

Use `null` for unavailable store, online play, or trailer links. Use `"coming-soon"` for an unpublished online play link. Trailer MP4 files live in `assets/videos/`.

New games can be added by adding one new object to `MASTERGAMER_GAMES`. The Games Library and Featured Games section render from this data file automatically.

## Editing News

Open `news.js` and update the objects in `MASTERGAMER_NEWS`.

Each article includes:

- `title`
- `date`
- `image`
- `summary`
- `url`

The homepage displays the three most recent articles automatically. The full News & Updates page displays every article in date order.

## Running Locally

No build step is required.

Option 1: open `index.html` directly in a browser.

Option 2: run a small local server from this folder:

```powershell
python -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Publishing

Upload the contents of this folder to any static host, such as Netlify, Vercel, GitHub Pages, Cloudflare Pages, or standard web hosting.

If deploying the whole Codex project folder to Vercel, keep the root `vercel.json` file in place. It rewrites root-level requests to the static site in `outputs/` so paths such as `assets/site/mastergamer-logo.png`, `styles.css`, `games.js`, and each page URL resolve correctly.

Before publishing, review store links, online play links, trailer files, and legal text with final studio-approved content.
