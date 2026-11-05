const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const icons = require('../src/orix-icons-ui.js');
const vm = require('node:vm');

test('two-tone layer headings remain readable on light and high-contrast surfaces', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/icons-ui.js'), 'utf8');
  const start = source.indexOf('drawHeader = function (alpha)');
  const end = source.indexOf('hit.back = null;', start);
  for (const state of [{ theme: 'light', highContrast: 'false', text: '#171b20' }, { theme: 'dark', highContrast: 'true', text: 'CanvasText' }]) {
    const colors = [], context = { drawHeader() {}, islandBounds: { x: 0, width: 500, height: 250 }, currentView: 'note',
      ctx: { save() {}, restore() {}, measureText: () => ({ width: 24 }) }, TITLES: { note: ['Notitie', 'Note'] }, en: () => true,
      window: { __orixCanvasColors: { text: state.text } }, document: { documentElement: { dataset: state } },
      text: (_s, _x, _y, _size, color) => colors.push(color) };
    vm.runInNewContext(source.slice(start, end) + '};', context); context.drawHeader(1);
    assert.deepEqual(colors, [state.text, state.text]);
  }
});

test('product icons distinguish Claude Code, Claude, Codex and ChatGPT with local branded assets', () => {
  const outputs = ['claudecode', 'claude', 'codex', 'chatgpt', 'spotify'].map(name => icons.html(name));
  assert.equal(new Set(outputs).size, 5);
  for (const html of outputs) {
    for (const match of html.matchAll(/src="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(__dirname, '../src', match[1])));
    assert.match(html, /aria-hidden="true"/);
    assert.doesNotMatch(html, /https?:|<script/);
  }
  assert.match(icons.html('claudecode'), /claudecode\.svg/);
  assert.match(icons.html('codex'), /codex_dark\.svg/);
  assert.match(icons.html('codex'), /codex_light\.svg/);
});

test('interface icons use consistent SVG shapes and reject unknown names', () => {
  for (const name of ['home', 'appearance', 'grid', 'settings', 'context', 'focus', 'tray', 'clipboard', 'note', 'clock', 'sun', 'moon']) {
    assert.match(icons.html(name), /viewBox="0 0 24 24"/);
    assert.match(icons.html(name), /stroke-width="1.8"/);
  }
  assert.equal(icons.html('<img src=x onerror=alert(1)>'), '');
});
test('canvas integrations use the same attributed brand files as DOM controls', () => {
  assert.equal(icons.asset('codex', 'light'), '../assets/icons/brands/codex_light.svg');
  assert.equal(icons.asset('codex', 'dark'), '../assets/icons/brands/codex_dark.svg');
  assert.equal(icons.asset('claudecode', 'light'), '../assets/icons/brands/claudecode.svg');
  assert.equal(icons.asset('unknown', 'light'), '');
});
