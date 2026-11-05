const test = require('node:test');
const assert = require('node:assert/strict');
const nav = require('../orix-navigation-ui.js');

test('canonical dashboard routes and every legacy entry map to working destinations', () => {
  const cases = { home: ['overview', null], overview: ['overview', null], karakter: ['appearance', null], wardrobe: ['appearance', null],
    appearance: ['appearance', null], apps: ['modules', null], modules: ['modules', null], connect: ['settings', 'connections'],
    ai: ['settings', 'ai'], general: ['settings', 'general'], news: ['settings', 'updates'], settings: ['settings', 'general'],
    'settings/connections': ['settings', 'connections'], 'settings/ai': ['settings', 'ai'], 'settings/updates': ['settings', 'updates'],
    'settings/about': ['settings', 'about'] };
  for (const [input, [page, section]] of Object.entries(cases)) assert.deepEqual(nav.resolveRoute(input), { page, section });
  for (const input of [null, '', '<script>', 'unknown', 'settings/untrusted']) assert.equal(nav.resolveRoute(input).page, 'overview');
});
test('navigation preserves all existing catalog IDs and core items', () => {
  assert.deepEqual(nav.modules.map(x => x.id), ['claude', 'buddy', 'spotify', 'focus', 'tray', 'clips', 'note', 'clock', 'settings']);
  assert.deepEqual(nav.modules.filter(x => x.core).map(x => x.id), ['claude', 'settings']);
  for (const item of nav.modules) { assert.equal(item.en.length, 2); assert.equal(item.nl, undefined); }
});

 test('Connections omits unavailable future chat-app placeholders but keeps existing coding integrations', () => {
  const fs = require('node:fs'), vm = require('node:vm');
  const source = fs.readFileSync(require.resolve('../settings-app.html'), 'utf8');
  const draw = source.slice(source.indexOf('function drawConnect()'), source.indexOf('async function toggleConnect('));
  let html = '';
  const context = { tab: 'connect', cxs: { list: [
    { id: 'claudecode', available: true, on: true }, { id: 'codex', available: true, on: false },
    { id: 'claude', soon: true }, { id: 'chatgpt', soon: true }
  ] }, t: () => ({ cx: { claudecode: ['Claude Code', 'coding'], codex: ['Codex', 'coding'], claude: ['Claude app', 'future'], chatgpt: ['ChatGPT app', 'future'] }, cxAgents: 'Coding AI', cxChats: 'Chat apps', cxHow: 'Connections', cxOn: 'Connected', cxSoon: 'Coming soon', cxSoonNote: 'future' }), esc: x => x, icon: () => '', cxNote: {}, cxPending: false, paint: value => { html = value; }, $: () => ({ classList: { toggle() {} } }) };
  vm.runInNewContext(draw + '\ndrawConnect();', context);
  assert.match(html, /Claude Code/); assert.match(html, /Codex/);
  assert.doesNotMatch(html, /Coming soon|Claude app|ChatGPT app|Chat apps/);
});

test('connection switches expose their state and update it on click', () => {
  const fs = require('node:fs'), vm = require('node:vm'), source = fs.readFileSync(require.resolve('../settings-app.html'), 'utf8');
  const draw = source.slice(source.indexOf('function drawConnect()'), source.indexOf('async function toggleConnect(')); let html = '';
  const context = { tab: 'connect', cxs: { list: [{ id: 'claudecode', available: true, on: true }, { id: 'codex', available: false, on: false }] }, t: () => ({ cx: { claudecode: ['Claude Code', 'coding'], codex: ['Codex', 'coding'] }, cxAgents: 'Coding AI', cxHow: 'Connections', cxOn: 'Connected', cxMissing: 'Unavailable' }), esc: x => x, icon: () => '', cxNote: {}, cxPending: false, paint: value => { html = value; }, $: () => ({ classList: { toggle() {} } }) };
  vm.runInNewContext(draw + '\ndrawConnect();', context);
  assert.match(html, /data-cx="claudecode"[^>]*aria-pressed="true"/); assert.match(html, /data-cx="codex"[^>]*disabled[^>]*aria-pressed="false"/);
  context.cxPending = true; context.drawConnect();
  assert.match(html, /data-cx="claudecode"\s+aria-disabled="true"/);
  const handler = source.match(/if \(tab === 'connect' && b\.dataset\.cx\) \{[^\n]+\}/)?.[0]; assert.ok(handler);
  const attrs = {}, classes = { on: false, toggle() { this.on = !this.on; }, contains() { return this.on; } }, b = { dataset: { cx: 'claudecode' }, classList: classes, setAttribute: (k, v) => { attrs[k] = v; } }; let action;
  vm.runInNewContext('(function(){' + handler + '})()', { tab: 'connect', b, cxPending: false, toggleConnect: (...args) => { action = args; } });
  assert.equal(attrs['aria-pressed'], 'true'); assert.equal(attrs['aria-disabled'], 'true');
  assert.notEqual(b.disabled, true, 'pending switch must retain keyboard focus');
  assert.deepEqual(action, ['claudecode', true]);
});

test('connection changes ignore duplicate requests and restore confirmed state after failure', async () => {
  const fs = require('node:fs'), vm = require('node:vm'), source = fs.readFileSync(require.resolve('../settings-app.html'), 'utf8');
  const start = source.indexOf('async function toggleConnect('), end = source.indexOf('async function drawAbout()', start); assert.ok(start >= 0 && end > start);
  let reject, count = 0, draws = 0; const errors = [], original = { ok: true, list: [{ id: 'codex', on: false }] };
  const context = { S: { connect: () => { count++; return new Promise((_resolve, fail) => { reject = fail; }); }, connections: async () => original }, t: () => ({ cx: { codex: ['Codex'] }, cxRestart: () => '', cxCodexTrust: '' }), cxNote: {}, cxs: original, cxPending: false, drawConnect: () => { draws++; }, toast: (text, bad) => errors.push([text, bad]) };
  vm.runInNewContext(source.slice(start, end), context);
  const pending = context.toggleConnect('codex', true), duplicate = context.toggleConnect('codex', false); assert.equal(count, 1);
  reject(new Error('Connection failed')); await Promise.all([pending, duplicate]);
  assert.equal(context.cxPending, false); assert.equal(context.cxs, original); assert.deepEqual(errors, [['Connection failed', true]]); assert.ok(draws > 0);
});

test('connection failure still redraws the last confirmed state when refresh also fails', async () => {
  const fs = require('node:fs'), vm = require('node:vm'), source = fs.readFileSync(require.resolve('../settings-app.html'), 'utf8');
  const start = source.indexOf('async function toggleConnect('), end = source.indexOf('async function drawAbout()', start); const original = { ok: true, list: [{ id: 'codex', on: false }] }; let drawn, message;
  const context = { S: { connect: async () => null, connections: async () => { throw Error('offline'); } }, t: () => ({ cx: { codex: ['Codex'] } }), cxNote: {}, cxs: original, cxPending: false, drawConnect: () => { drawn = context.cxs; }, toast: text => { message = text; } };
  vm.runInNewContext(source.slice(start, end), context); await context.toggleConnect('codex', true);
  assert.equal(context.cxPending, false); assert.equal(drawn, original); assert.match(message, /Could not update connection/);
});

test('successful connection updates confirmed state and clears pending flag', async () => {
  const fs = require('node:fs'), vm = require('node:vm'), source = fs.readFileSync(require.resolve('../settings-app.html'), 'utf8');
  const start = source.indexOf('async function toggleConnect('), end = source.indexOf('async function drawAbout()', start), updated = { ok: true, list: [{ id: 'codex', on: true }] }; let drawn = 0;
  const context = { S: { connect: async () => updated }, t: () => ({ cx: { codex: ['Codex'] }, cxRestart: name => 'Restart ' + name, cxCodexTrust: 'Trust ORIX' }), cxNote: {}, cxs: null, cxPending: false, drawConnect: () => drawn++, toast: () => { throw Error('unexpected error'); } };
  vm.runInNewContext(source.slice(start, end), context); await context.toggleConnect('codex', true);
  assert.equal(context.cxs, updated); assert.equal(context.cxPending, false); assert.equal(drawn, 1); assert.equal(context.cxNote.codex, 'Restart Codex Trust ORIX');
});

test('Overview tool buttons identify the tool in their accessible names', () => {
  const fs = require('node:fs'), vm = require('node:vm'), source = fs.readFileSync(require.resolve('../settings-app.html'), 'utf8');
  const declaration = source.match(/const tool = \(id, shape, title\) => [^\n]+/); assert.ok(declaration);
  const c = { icon: () => '', esc: value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;'), layerState: { visible: true }, t: () => ({ openTool: 'Open', showToOpen: 'Show the layer first' }) };
  vm.runInNewContext(declaration[0] + '\nglobalThis.makeTool = tool;', c);
  for (const [id, title] of [['note', 'Note'], ['focus', 'Focus'], ['clips', 'Clipboard']]) assert.match(c.makeTool(id, id, title), new RegExp(`aria-label="Open ${title}"`));
  c.layerState.visible = false; const disabled = c.makeTool('note', 'note', 'Note'); assert.match(disabled, /disabled/); assert.match(disabled, /aria-label="Open Note"/);
  assert.match(c.makeTool('x', 'x', 'Name "One"'), /aria-label="Open Name &quot;One&quot;"/);
});
