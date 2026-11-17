# Nile Basin Manufacturers Association — Website

Official website for **Nile Basin Manufacturers Association Limited (NBMA)**, a membership-based institution representing manufacturers in Uganda and the Nile Basin.

Plain Node.js (no framework, no build step) with server-rendered pages, deployed on Railway with PostgreSQL for form submissions.

## Pages

`/` Home · `/about` About & governance · `/membership` Membership & FAQ · `/join` Membership application · `/programmes` Manufacturer services · `/advocacy` Policy positions · `/resources` Resources and survey · `/events` Events · `/contact` Contact · `/privacy` Privacy · `/terms` Website terms · `/media-credits` Media credits and licensing.

The website does not claim international offices, partners, member statistics, endorsements or events that are not verified. There is no demo member data and there are no testimonials.

## Project layout

```
server.js            HTTP server: routing, security headers, static files, form API
site.js              Page templates, navigation and the media register
public/app.js        Client behaviour: video reel, header, menu drawer, transitions, forms
public/styles.css    All styles
public/assets/       Logo emblem, favicon, icons, branded fallback backdrop
public/media/        Optional self-hosted hero video (not committed)
tests/               node:test suites (npm test)
docs/                Launch checklist and media licensing register
```

## Design

- **Layout:** full-screen panels on the home page, each with a headline at the top and two actions at the bottom, over full-bleed documentary photography. Inner pages open with a full-width photo header. The header is transparent over imagery and turns frosted white over light content. The menu slides in from the right.
- **Video:** the home hero is a reel of three Ugandan production clips (coffee processing, hand wood carving, coffee pulping) that **crossfade** every 8 seconds, with a slow push-in, progress indicators and a pause button. Clips pause when off-screen or when the tab is hidden. Chrome, Firefox and Edge play VP9 WebM; Safari gets an MPEG-4 fallback. If a clip can't play, its still frame is shown.
- **Transitions:** headlines fade and rise as each panel enters, photos ease out of a slight zoom, cards reveal in sequence, and navigating between pages cross-fades (CSS View Transitions; Chromium browsers, ignored elsewhere). With `prefers-reduced-motion`, the reel does not autoplay and all motion is removed.
- **Brand:** navy `#071d46` and gold `#ffb95c`; type is **Manrope** (Google Fonts). The header uses a letter-spaced **NBMA** wordmark; the footer uses the factory emblem cut from the official logo file.

## Development

```bash
npm install
npm run check   # syntax check
npm test        # unit + HTTP tests
npm start       # http://localhost:3000
```

Static pages work without PostgreSQL; form submissions return `503` until a database is configured.

## Deploying on Railway

1. In Railway, **New Project → Deploy from GitHub repo** and select this repository. Railway runs `npm start` (see `railway.json`).
2. Add a **PostgreSQL** service and set the web service's `DATABASE_URL` to its reference variable.
3. Set `NODE_ENV=production` and `PUBLIC_URL=https://your-domain` (for canonical URLs and the sitemap).
4. Deploy, then check `/healthz` (reports whether a database is *configured*, not live connectivity). Submit a consented test application and confirm that it lands in PostgreSQL.
5. Review the privacy notice, retention procedure and contact details with the NBMA Board **before accepting real personal data**.

Behind Railway's proxy, the rate limiter keys on the client IP from `X-Forwarded-For`. This is detected automatically from Railway's environment variables; override it with `TRUST_PROXY=1` or `TRUST_PROXY=0`.

### Submissions

The forms **do not send email** and **do not admit members automatically**. They save records in the `nbma_submissions` table. There is deliberately no unauthenticated admin page; review submissions in Railway's PostgreSQL console:

```sql
SELECT id, kind, submitted_at, status, payload
FROM nbma_submissions
ORDER BY submitted_at DESC LIMIT 50;
```

### Security

- Server-side validation, a 16 KB body limit, a honeypot field, per-IP throttling, same-origin checks and parameterised SQL.
- Strict Content-Security-Policy: scripts and styles from the site only (no inline code), images and video from the site and Wikimedia (`commons`, `upload`, `thumb`), fonts from Google.
- The in-memory rate limiter is per instance. For multi-replica deployments, use a shared limiter (Redis or edge) plus a CAPTCHA or WAF.
- Before wide rollout, configure encrypted backups, retention and deletion rules, and monitoring. Content may need legal review under Uganda's Data Protection and Privacy Act.

## Media

All documentary photos and video are loaded from **Wikimedia Commons** and credited on each panel, in the footer and on `/media-credits`. The single source of truth is the `media` register in `site.js`; `docs/REGIONAL_MEDIA_SOURCES.md` is the human-readable register. The images show regional industry, **not** NBMA members, programmes or partners.

To use your own licensed hero footage, add `public/media/manufacturing-hero.mp4`. The server detects it at startup and makes it the first clip in the reel. Record its licence in the media register before publishing.

**Logo:** the official logo files live in the NBMA brand-assets Google Drive folder (`logo on white.jpg`, `logo on blue.jpg`). The site uses transparent cut-outs of them in `public/assets/`:

| File | Use |
|---|---|
| `nbma-emblem-white.webp` | Header emblem over video and photos |
| `nbma-emblem-navy.webp` | Header emblem over light content |
| `nbma-logo.webp` | Full logo with name: footer and menu drawer |
| `favicon-48.png`, `apple-touch-icon.png` | Browser tab and home-screen icons |

If the logo changes, re-export these files from the new originals at the same names.

## Current limits

This is a deployable initial release, not a fully verified production service. Member login, fees and payments, email delivery and membership approval workflows are **not yet implemented**. No GitHub Actions CI is configured; run `npm run check && npm test` before deploying.
