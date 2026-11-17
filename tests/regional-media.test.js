import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, media } from '../site.js';

test('homepage shows credited East African documentary photos', () => {
  const html = renderPage('/').html;
  for (const file of ['Steelworkers.jpg', 'A%20man%20operating%20the%20maize%20mill', 'Workforce%20Sandstorm%20factory.jpg', 'Tailors%20working%20in%20in%20a%20fashion%20factoryTanzania.jpg']) {
    assert.ok(html.includes(file), file);
  }
  for (const m of Object.values(media).filter((x) => x.kind === 'photo')) assert.ok(html.includes(m.creator), m.creator);
  assert.ok(html.includes('do not imply NBMA membership'));
});

test('homepage hero reel crossfades three credited Ugandan clips with webm + Safari fallbacks', () => {
  const html = renderPage('/').html;
  assert.equal((html.match(/class="reel-slide/g) || []).length, 3);
  assert.equal((html.match(/class="reel-dot"/g) || []).length, 3);
  for (const m of [media.coffee, media.carving, media.pulping]) {
    assert.ok(html.includes(m.webm), m.webm);
    assert.ok(html.includes(m.mov), m.mov);
    assert.ok(html.includes(m.creator), m.creator);
  }
  assert.match(html, /class="reel-toggle"[^>]*aria-label="Pause background video"/);
});

test('optional self-hosted hero video becomes the first reel slide', () => {
  const html = renderPage('/', '', { localHeroVideo: true }).html;
  assert.equal((html.match(/class="reel-slide/g) || []).length, 4);
  assert.ok(html.indexOf('/media/manufacturing-hero.mp4') < html.indexOf(media.coffee.webm));
});

test('pages contain no inline event handlers, scripts or style attributes (blocked by CSP)', () => {
  for (const path of ['/', '/about', '/contact', '/join', '/media-credits']) {
    const html = renderPage(path).html;
    assert.doesNotMatch(html, /\son[a-z]+="/i, path);
    assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)/i, path);
    assert.doesNotMatch(html, /\sstyle="/i, path);
  }
});
