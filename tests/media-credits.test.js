import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, knownRoutes, media } from '../site.js';

test('public media credits page attributes every third-party asset', () => {
  const { status, html } = renderPage('/media-credits');
  assert.equal(status, 200);
  for (const m of Object.values(media)) {
    assert.ok(html.includes(m.creator), m.creator);
    assert.ok(html.includes(encodeURIComponent(m.file.replace(/ /g, '_'))), m.file);
  }
  for (const s of ['Emmanuel Ssekaggo', 'creativecommons.org/licenses/by-sa/4.0/', 'creativecommons.org/publicdomain/zero/1.0/', 'Official NBMA logo']) {
    assert.ok(html.includes(s), s);
  }
  assert.ok(knownRoutes.includes('/media-credits'));
  assert.ok(renderPage('/').html.includes('href="/media-credits"'));
});
