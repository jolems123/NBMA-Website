import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, knownRoutes } from '../site.js';
import { validateSubmission, createServer } from '../server.js';

for (const p of knownRoutes) {
  test(`Page ${p} returns valid structured content`, () => {
    const o = renderPage(p, 'https://nbma.example');
    assert.equal(o.status, 200);
    assert.match(o.html, /<main id="main">/);
    assert.match(o.html, /<title>/);
    assert.match(o.html, /Nile Basin Manufacturers/);
    assert.match(o.html, /rel="canonical"/);
    assert.equal((o.html.match(/<h1[\s>]/g) || []).length, 1, 'exactly one h1');
  });
}

test('Unknown page is 404', () => assert.equal(renderPage('/not-real').status, 404));

test('Contact validation blocks incomplete input', () => assert.ok(validateSubmission('contact', { consent: 'yes', email: 'bad' })));

test('Contact validation accepts valid input', () =>
  assert.equal(
    validateSubmission('contact', { consent: 'yes', name: 'Sample User', email: 'user@example.org', organization: 'Example factory', topic: 'Membership', message: 'I would like to know more about NBMA.' }),
    null,
  ));

test('Membership validation blocks incomplete input', () => assert.ok(validateSubmission('membership', { consent: 'yes', businessName: 'Factory' })));

test('Membership validation accepts valid input', () =>
  assert.equal(
    validateSubmission('membership', { consent: 'yes', businessName: 'Factory', contactName: 'A Person', email: 'a@example.org', phone: '+256 700 000000', district: 'Mukono', sector: 'Agro-processing', employees: '5–19', registration: 'Registered business', products: 'Maize flour', priority: 'Market access' }),
    null,
  ));

test('Honeypot detected', () => assert.equal(validateSubmission('contact', { website: 'bot.example', consent: 'yes' }), 'invalid'));

async function withServer(fn) {
  const s = createServer();
  await new Promise((r) => s.listen(0, '127.0.0.1', r));
  try {
    await fn(`http://127.0.0.1:${s.address().port}`);
  } finally {
    await new Promise((r) => s.close(r));
  }
}

test('Server serves page, assets, health and protects forms without DB', () =>
  withServer(async (root) => {
    let r = await fetch(root + '/');
    assert.equal(r.status, 200);
    assert.match(await r.text(), /Stronger industry/);
    r = await fetch(root + '/styles.css');
    assert.equal(r.status, 200);
    r = await fetch(root + '/assets/nbma-emblem.webp');
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'image/webp');
    r = await fetch(root + '/healthz');
    assert.equal(r.status, 200);
    r = await fetch(root + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', email: 'j@example.com', topic: 'Membership', message: 'Please tell me about the association.', consent: 'yes' }),
    });
    assert.equal(r.status, 503);
  }));

test('CSP allows Wikimedia images and video but no inline script', () =>
  withServer(async (root) => {
    const csp = (await fetch(root + '/')).headers.get('content-security-policy');
    assert.match(csp, /img-src [^;]*https:\/\/upload\.wikimedia\.org/);
    assert.match(csp, /img-src [^;]*https:\/\/commons\.wikimedia\.org/);
    assert.match(csp, /media-src [^;]*https:\/\/upload\.wikimedia\.org/);
    assert.match(csp, /img-src [^;]*https:\/\/thumb\.wikimedia\.org/);
    assert.match(csp, /script-src 'self'(;|$)/);
  }));

test('Static files reject path traversal', () =>
  withServer(async (root) => {
    const r = await fetch(root + '/%2e%2e/server.js');
    assert.notEqual(r.status, 200);
  }));
