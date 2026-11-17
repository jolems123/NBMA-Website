# Nile Basin Manufacturers Association — Official Website Starter

A production-oriented, responsive, page-specific website for **Nile Basin Manufacturers Association Limited (NBMA)**, a membership-based institution representing manufacturers. Official NBMA branding from the user-supplied assets is included.

## Pages

`/` Home · `/about` About & governance · `/membership` Membership & FAQ · `/join` Membership application · `/programmes` Manufacturer services · `/advocacy` Policy positions · `/resources` Resources and manufacturer survey · `/events` Events · `/contact` Contact · `/privacy` Privacy · `/terms` Website terms · `/media-credits` media credits and licensing.

The website does not falsely claim international offices, partners, member statistics, verified endorsements, or events. No demo member data or fake testimonials.

## Railway + GitHub (recommended)

1. Create a **private** GitHub repository for NBMA. Extract this ZIP to your machine, open the folder in VS Code and push the contents to the repository (do not commit `.env`).
2. In Railway, **New Project → Deploy from GitHub repo** and select that repository. Railway builds the Node.js service and starts it using `npm start`.
3. Add a Railway **PostgreSQL** database service to the same project.
4. Set the web service's `DATABASE_URL` to the Railway Postgres **`DATABASE_URL` reference variable** (rather than copying a password to a public file). Railway exposes port `PORT`; there is no need to specify it manually.
5. Set `NODE_ENV=production` and `PUBLIC_URL=https://your-verified-domain` for canonical URLs and sitemap generation. Configure a public domain in Railway.
6. Deploy. Visit `/healthz` (the endpoint reports that DB is configured, not live DB connectivity). Submit a **consented test application**, then verify its storage in PostgreSQL. Test the contact form as well.
7. A Ugandan coffee-processing video from Wikimedia Commons is referenced as the hero WebM fallback; an optional locally licensed MP4 at `public/media/manufacturing-hero.mp4` takes priority. The branded background works when neither video is available. Photographs of factories and manufacturing in Uganda, Kenya and Tanzania are also loaded from Wikimedia Commons with credits. External media requires connectivity.
8. Review the privacy notice, data retention procedure and contact details with the NBMA Board **before accepting real personal data**.

### Important: submissions

Application and contact forms **do not send email** and **do not automatically admit members**. They save private structured records into Railway PostgreSQL table `nbma_submissions`. If DB is missing or unavailable, the forms return `503` with a friendly message rather than pretending to accept records.

The database is intentionally **not exposed through an unauthenticated admin page**. To review submissions in the initial release, use Railway's authenticated PostgreSQL query console:

```sql
SELECT id, kind, submitted_at, status, payload
FROM nbma_submissions
ORDER BY submitted_at DESC LIMIT 50;
```

Do not expose database credentials in the browser. A fully featured member/admin dashboard with roles, MFA, reviewer actions, audit log and transactional emails is a separate implementation phase; it is **not** claimed complete in this ZIP.

### Security essentials

- Server-side input validation, strict request body limit, honeypot, coarse in-memory throttling, same-origin request validation, CSP, security headers and SQL parameters.
- No public data-extraction endpoint.
- No storing sensitive passwords, payment details, identity document numbers or secret industrial formulas.
- For multi-replica production traffic use shared Redis/edge rate limits and CAPTCHA/WAF; the in-memory limiter is per-instance only.
- Configure encrypted backups, retention/deletion rules, database access restrictions and operational monitoring before wide rollout.
- Content may need independent legal review under Uganda's Data Protection and Privacy Act and company governing documents.

## Development and tests

```bash
npm install
npm run check
npm test
npm start
```

The static pages and read-only endpoints work without PostgreSQL; form submissions need a configured DB.

### No GitHub Actions CI

This package deliberately includes **no `.github/workflows` folder**, no CI jobs and no preview deployment configuration. Run the local checks above in VS Code; Railway will still need to build the application when deployed.

## Branding, typography and videos

- Official logo image: `public/assets/nbma-official-logo.webp` and cropped mark `public/assets/nbma-mark.webp`. Source: provided official `logo on white.jpg` from NBMA branding assets.
- Palette: navy `#071d46`, gold `#ffb95c`, neutral white/stone.
- Typography: **Manrope**, a freely hosted geometric sans-serif with a clean automotive/technology aesthetic. *Tesla's proprietary branded font files are not included or redistributed.*
- Motion: short CSS transitions with `prefers-reduced-motion` support; never blocks page navigation.
- Background manufacturing video: optional local licensed asset; robust accessible SVG fallback bundled.
- Video sources you can license/download after reviewing their terms: https://mixkit.co/free-stock-video/manufacturing/ and https://www.pexels.com/search/videos/manufacturing/ .

## Governance and editorial notes

- Membership fees, categories and voting rights must be agreed by the appropriate organs under registered Articles; this site does not state unverified pricing.
- No fabricated count of members, branch offices, government MoUs, events, or completed training.
- Board draft papers and internal member files are never automatically published.
- Public survey link points to the NBMA Google Form shared during development.
- Review brand copy, compliance disclosures and latest contact details before public launch.

## Current implementation limits

This is a deployable initial website release, not a fully verified production service. It needs a Railway-connected PostgreSQL database, real manufacturing video footage, legal/privacy review, and a real deployment/test cycle. Member login, fees/payment processing, email delivery and membership approval workflows are **not yet implemented**.

## Regional media update — Uganda & East Africa (17 November 2026)

The homepage now features images of Ugandan steelworking, Ugandan maize milling, Kenyan textile manufacturing and Tanzanian garment production. The hero references a Ugandan coffee-processing clip. All documentary media is from Wikimedia Commons and the site displays links to their source/credit/licence. **These depict regional industry, not necessarily NBMA members, programmes or partners.**

- Video: [Coffee from dan 2.webm](https://commons.wikimedia.org/wiki/File:Coffee_from_dan_2.webm), Uganda, Denis Kasozi, CC BY-SA 4.0.
- Photo: [Steelworkers.jpg](https://commons.wikimedia.org/wiki/File:Steelworkers.jpg), Jinja, Uganda, CC BY-SA 4.0.
- Photo: [A man operating the maize mill to produce maize flour.jpg](https://commons.wikimedia.org/wiki/File:A_man_operating_the_maize_mill_to_produce_maize_flour.jpg), Uganda. CC BY-SA 4.0; follow source-file attribution.
- Photo: [Workforce Sandstorm factory.jpg](https://commons.wikimedia.org/wiki/File:Workforce_Sandstorm_factory.jpg), Kenya. CC BY-SA 4.0; follow source-file attribution.
- Photo: [Tailors working in in a fashion factoryTanzania.jpg](https://commons.wikimedia.org/wiki/File:Tailors_working_in_in_a_fashion_factoryTanzania.jpg), Tanzania. CC BY-SA 4.0; follow source-file attribution.

**Production note:** Wikimedia Commons media is served remotely using `Special:FilePath`. If an external host is blocked or rate-limited, photo fallback styling remains and the video falls back to the navy background. Before public launch, validate the precise attribution/license for every photo and preferably self-host optimised authorized copies. Do not imply photographers or pictured factories endorse NBMA.

## Media acknowledgements

The website now has a dedicated `/media-credits` public page with creator names where verified, direct original-file links, Creative Commons licence links and an acknowledgement of NBMA official brand assets. The same credits also appear near photos and in the footer for the video. See `docs/REGIONAL_MEDIA_SOURCES.md` for the complete asset register, outstanding author verification and licensing obligations. Verify the unconfirmed maize-milling creator and any replacement video before publishing.
