import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../site.js';
test('homepage credits real East African documentary media and uses Ugandan video',()=>{
 const html=renderPage('/').html;
 for (const name of ['Steelworkers.jpg','A%20man%20operating%20the%20maize%20mill','Workforce%20Sandstorm%20factory.jpg','Tailors%20working%20in%20in%20a%20fashion%20factoryTanzania.jpg','Coffee%20from%20dan%202.webm']) assert.ok(html.includes(name),name);
 assert.ok(html.includes('Photo credit and licence'));
 assert.ok(html.includes('not imply NBMA membership'));
});
