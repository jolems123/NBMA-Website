import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPage, knownRoutes} from '../site.js';
test('public media credits are accessible and attributed',()=>{
 const response=renderPage('/media-credits');
 assert.equal(response.status,200);
 for (const credit of ['The Ethnographer','Elisabeth Smeds','Thukuk','Denis Kasozi','A_man_operating_the_maize_mill','creativecommons.org/licenses/by-sa/4.0/','Official NBMA logo']) assert.ok(response.html.includes(credit),credit);
 assert.ok(knownRoutes.includes('/media-credits'));
 assert.ok(renderPage('/').html.includes('href="/media-credits"'));
});
