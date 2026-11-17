import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { renderPage, knownRoutes, sectors } from './site.js';

const base = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(base, 'public');
const port = Number(process.env.PORT || 3000);
const prod = process.env.NODE_ENV === 'production';
const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

// Railway (and most PaaS) terminate TLS at a proxy, so the socket address is the proxy's.
const trustProxy =
  process.env.TRUST_PROXY === '1' ||
  (process.env.TRUST_PROXY !== '0' && Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME));

const localHeroVideo = fs.existsSync(path.join(publicDir, 'media', 'manufacturing-hero.mp4'));

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
};
const VIDEO_EXT = new Set(['.mp4', '.webm']);

// Documentary photos and video are served from Wikimedia Commons; Special:FilePath
// redirects to thumb.wikimedia.org / upload.wikimedia.org, so all three hosts are allowed.
const WIKIMEDIA = 'https://commons.wikimedia.org https://upload.wikimedia.org https://thumb.wikimedia.org';
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "connect-src 'self'",
  `img-src 'self' data: ${WIKIMEDIA}`,
  `media-src 'self' ${WIKIMEDIA}`,
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' https://fonts.googleapis.com",
  "script-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

function setBaseHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', CSP);
  if (prod) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
}

function json(res, status, body, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
  res.end(JSON.stringify(body));
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

let pgPool = null;
let initPromise = null;

async function initializeDb() {
  if (!process.env.DATABASE_URL) return false;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { Pool } = await import('pg');
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        connectionTimeoutMillis: 5000,
        ssl: process.env.DATABASE_SSL === 'require' ? { rejectUnauthorized: false } : undefined,
      });
      await pgPool.query(`CREATE TABLE IF NOT EXISTS nbma_submissions (
        id UUID PRIMARY KEY,
        kind VARCHAR(32) NOT NULL CHECK (kind IN ('contact','membership')),
        payload JSONB NOT NULL,
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status VARCHAR(32) NOT NULL DEFAULT 'new'
      )`);
      await pgPool.query(
        'CREATE INDEX IF NOT EXISTS idx_nbma_submissions_kind_date ON nbma_submissions (kind, submitted_at DESC)',
      );
      console.log('Database ready');
      return true;
    } catch (err) {
      console.error('Database init failed:', err.message);
      pgPool = null;
      return false;
    }
  })();

  const ok = await initPromise;
  if (!ok) initPromise = null; // allow a retry on the next submission
  return ok;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const MAX_BODY = 16 * 1024;
const allowedTopics = ['Membership', 'Standards and certification', 'Trade and markets', 'Partnerships', 'Policy and advocacy', 'Media', 'Other'];
const allowedEmployees = ['1–4', '5–19', '20–49', '50–99', '100–249', '250+'];
const allowedRegistration = ['Registered business', 'Registration in progress', 'Informal / not yet registered'];
const allowedPriority = ['Standards and certification', 'Market access', 'Finance / investment readiness', 'Manufacturing skills and technology', 'Industry advocacy', 'Supplier and industry linkages'];

/** Trim and cap a string at n+1 chars so over-length input is still detectable. */
const clean = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n + 1) : '');
const emailValid = (x) => x.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);

/** Returns null when valid, 'invalid' for honeypot hits, or a user-facing error message. */
export function validateSubmission(kind, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'Invalid submission.';
  if (data.consent !== 'yes') return 'Please confirm the privacy notice.';
  if (data.website) return 'invalid';

  if (kind === 'contact') {
    const name = clean(data.name, 100);
    const email = clean(data.email, 200);
    const organization = clean(data.organization, 160);
    const topic = clean(data.topic, 50);
    const message = clean(data.message, 3000);
    if (
      !name || name.length > 100 ||
      !emailValid(email) ||
      organization.length > 160 ||
      !allowedTopics.includes(topic) ||
      message.length < 10 || message.length > 3000
    ) {
      return 'Please check the required enquiry fields.';
    }
    return null;
  }

  if (kind === 'membership') {
    const required = { businessName: 160, contactName: 120, email: 200, phone: 30, district: 120, sector: 70, employees: 20, registration: 40, products: 1200, priority: 80 };
    for (const [key, max] of Object.entries(required)) {
      const v = clean(data[key], max);
      if (!v || v.length > max) return 'Please review all required membership fields.';
    }
    if (
      !emailValid(clean(data.email, 200)) ||
      !/^\+?[0-9 ()-]{7,30}$/.test(clean(data.phone, 30)) ||
      ![...sectors, 'Other manufacturing'].includes(data.sector) ||
      !allowedEmployees.includes(data.employees) ||
      !allowedRegistration.includes(data.registration) ||
      !allowedPriority.includes(data.priority) ||
      clean(data.notes, 1500).length > 1500
    ) {
      return 'Please check the contact and manufacturing details.';
    }
    return null;
  }

  return 'Unsupported form.';
}

// ---------------------------------------------------------------------------
// Rate limiting (per instance; use an edge/Redis limiter for multi-replica deployments)
// ---------------------------------------------------------------------------

const RATE_WINDOW = 60 * 60 * 1000;
const RATE_MAX = 12;
const buckets = new Map();

function clientIp(req) {
  if (trustProxy) {
    // The right-most X-Forwarded-For entry is the one appended by our own proxy.
    const hops = String(req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1].slice(0, 80);
  }
  return (req.socket.remoteAddress || 'unknown').slice(0, 80);
}

function rateLimited(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const hits = (buckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (hits.length >= RATE_MAX) {
    buckets.set(ip, hits);
    return true;
  }
  hits.push(now);
  buckets.set(ip, hits);
  if (buckets.size > 3000) {
    for (const [key, times] of buckets) if (times.every((t) => now - t > RATE_WINDOW)) buckets.delete(key);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Form submission
// ---------------------------------------------------------------------------

const FIELDS = {
  contact: ['name', 'email', 'organization', 'topic', 'message', 'consent'],
  membership: ['businessName', 'contactName', 'email', 'phone', 'district', 'sector', 'employees', 'registration', 'products', 'priority', 'notes', 'consent'],
};
const FIELD_MAX = { message: 3000, notes: 1500, products: 1200 };

async function handleSubmit(req, res, kind) {
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
    return json(res, 415, { error: 'Send JSON content.' });
  }

  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return json(res, 403, { error: 'Invalid request origin.' });
    } catch {
      return json(res, 403, { error: 'Invalid origin.' });
    }
  }

  if (rateLimited(req)) return json(res, 429, { error: 'Too many requests. Please try again later.' });

  let text = '';
  try {
    for await (const chunk of req) {
      text += chunk;
      if (Buffer.byteLength(text) > MAX_BODY) return json(res, 413, { error: 'The submission is too large.' });
    }
  } catch {
    return json(res, 400, { error: 'Unable to read the request.' });
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return json(res, 400, { error: 'Invalid JSON.' });
  }

  const err = validateSubmission(kind, data);
  if (err === 'invalid') return json(res, 200, { message: 'Thank you.' }); // honeypot: pretend success
  if (err) return json(res, 400, { error: err });

  if (!(await initializeDb())) {
    return json(res, 503, { error: 'Submissions are temporarily unavailable. Please contact NBMA by email.' });
  }

  const payload = {};
  for (const key of FIELDS[kind]) payload[key] = clean(data[key], FIELD_MAX[key] || 200);

  try {
    const id = crypto.randomUUID();
    await pgPool.query('INSERT INTO nbma_submissions (id, kind, payload) VALUES ($1, $2, $3)', [id, kind, JSON.stringify(payload)]);
    json(res, 201, {
      message:
        kind === 'membership'
          ? 'Your membership interest was received. NBMA will review your information.'
          : 'Your enquiry has been received. Thank you for contacting NBMA.',
      reference: id.slice(0, 8).toUpperCase(),
    });
  } catch (e) {
    console.error('Submission storage failed:', e.message);
    json(res, 503, { error: 'We could not save your submission. Please try again or email NBMA.' });
  }
}

// ---------------------------------------------------------------------------
// Static files
// ---------------------------------------------------------------------------

async function staticFile(req, res, pathname) {
  if (pathname.includes('..')) return false;
  const full = path.resolve(publicDir, pathname.slice(1));
  if (!full.startsWith(publicDir + path.sep)) return false;

  const ext = path.extname(full).toLowerCase();
  if (!MIME[ext]) return false;

  let stat;
  try {
    stat = await fsp.stat(full);
    if (!stat.isFile()) return false;
  } catch {
    return false;
  }

  res.setHeader('Content-Type', MIME[ext]);
  res.setHeader('Cache-Control', prod ? 'public, max-age=86400' : 'no-cache');
  const size = stat.size;

  if (VIDEO_EXT.has(ext)) {
    res.setHeader('Accept-Ranges', 'bytes');
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = m?.[1] ? Number(m[1]) : m?.[2] ? Math.max(0, size - Number(m[2])) : 0;
      const end = m?.[1] && m?.[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      if (!m || start > end || start >= size) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` });
        res.end();
        return true;
      }
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') res.end();
      else fs.createReadStream(full, { start, end }).pipe(res);
      return true;
    }
  }

  res.writeHead(200, { 'Content-Length': size });
  if (req.method === 'HEAD') res.end();
  else fs.createReadStream(full).pipe(res);
  return true;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export function createServer() {
  return http.createServer(async (req, res) => {
    setBaseHeaders(res);

    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch {
      return json(res, 400, { error: 'Bad request' });
    }
    const pathname = url.pathname.replace(/\/$/, '') || '/';

    try {
      if (pathname === '/healthz') {
        return json(res, 200, { status: 'ok', databaseConfigured: Boolean(process.env.DATABASE_URL) });
      }
      if (req.method === 'POST' && pathname === '/api/contact') return await handleSubmit(req, res, 'contact');
      if (req.method === 'POST' && pathname === '/api/applications') return await handleSubmit(req, res, 'membership');
      if (pathname.startsWith('/api/')) return json(res, 404, { error: 'Not found' });
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return json(res, 405, { error: 'Method not allowed' }, { Allow: 'GET, HEAD, POST' });
      }

      if (pathname === '/robots.txt') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(`User-agent: *\nAllow: /\nDisallow: /api/\n${publicUrl ? `Sitemap: ${publicUrl}/sitemap.xml\n` : ''}`);
      }
      if (pathname === '/sitemap.xml') {
        const origin = publicUrl || 'https://example.org';
        const urls = knownRoutes.map((p) => `<url><loc>${origin}${p}</loc></url>`).join('');
        res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
        return res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
      }

      if (await staticFile(req, res, pathname)) return;

      if (pathname === '/favicon.ico') {
        res.writeHead(302, { Location: '/assets/favicon-48.png' });
        return res.end();
      }

      const page = renderPage(pathname, publicUrl, { localHeroVideo });
      res.writeHead(page.status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=120' });
      return res.end(req.method === 'HEAD' ? '' : page.html);
    } catch (e) {
      console.error('Request failed:', e.message);
      if (!res.headersSent) json(res, 500, { error: 'Unexpected server error' });
      else res.end();
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer().listen(port, '0.0.0.0', async () => {
    console.log(`NBMA listening on ${port}`);
    if (process.env.DATABASE_URL) await initializeDb();
    else console.warn('DATABASE_URL not set; forms will return 503 until PostgreSQL is configured.');
  });
}
