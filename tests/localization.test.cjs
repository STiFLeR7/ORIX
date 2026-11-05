const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
test('canvas preserves project names that match legacy translated labels', () => {
  const source = fs.readFileSync(require.resolve('../mascot.html'), 'utf8');
  const name = source.indexOf('projectState.name,');
  const start = source.indexOf('\n', source.lastIndexOf('// project name', name)) + 1;
  const end = source.indexOf(');', name) + 2;
  let drawn;
  const context = { projectState: { name: 'Opslaan' }, startX: 0, width: 100, content: { y: 0 }, window: { __twocodeRawText: value => { drawn = value; } },
    text: value => { drawn = value === 'Opslaan' ? 'Save' : value; } };
  vm.runInNewContext(source.slice(start, end), context);
  assert.equal(drawn, 'Opslaan');
});
test('dashboard exposes only English controls and sections', () => {
  const source = fs.readFileSync(require.resolve('../settings-app.html'), 'utf8');
  const script = source.slice(source.indexOf('const T = {'), source.indexOf('const t = ()')) + '\nglobalThis.dictionaries = T;';
  const context = {}; vm.runInNewContext(script, context);
  const { en } = context.dictionaries;
  assert.deepEqual(Object.keys(context.dictionaries), ['en']);
  for (const key of ['themeMode', 'layerHelp', 'layerError', 'appearance', 'overview', 'modules', 'settings']) {
    assert.equal(typeof en[key], 'string');
  }
});
test('translation observer preserves marked user and provider content', () => {
  let callback;
  const node = { nodeType: 3, nodeValue: 'Opslaan', parentElement: { closest: selector => selector.includes('[data-user-content]') } };
  const context = { window: { __twocodePrefs: () => ({ lang: 'en' }) }, text() {},
    document: { body: {}, createTreeWalker: () => ({ nextNode: () => null }) },
    NodeFilter: { SHOW_TEXT: 4, SHOW_ELEMENT: 1 }, setInterval() {},
    MutationObserver: class { constructor(fn) { callback = fn; } observe() {} takeRecords() {} } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../i18n-ui.js'), 'utf8'), context);
  callback([{ type: 'childList', addedNodes: [node] }]);
  assert.equal(node.nodeValue, 'Opslaan');
});

test('tray preserves filenames that match translated interface labels', () => {
  const source = fs.readFileSync(require.resolve('../extras-ui.js'), 'utf8');
  const start = source.indexOf('  function render() {'), end = source.indexOf('  // ---------- quick mirror ----------', start);
  assert.ok(start >= 0 && end > start);
  const root = { innerHTML: '', querySelectorAll: () => [] };
  const context = { root, currentView: 'tray', trayFiles: [{ name: 'Opslaan.txt', path: 'C:/test/Opslaan.txt', size: 12 }], trayError: '', esc: String, window: { __twocodePrefs: () => ({ lang: 'en' }) } };
  vm.runInNewContext(source.slice(start, end) + '\nrender();', context);
  assert.match(root.innerHTML, /<button[^>]*class="ex-open"[^>]*data-user-content[^>]*aria-label="Opslaan\.txt"/);
  assert.match(root.innerHTML, /<span class="ex-name">Opslaan<\/span>/);
  assert.match(root.innerHTML, /class="ex-x"[^>]*aria-label="Uit de lade halen"/);
});

test('AI session project names are marked as user content', () => {
  const source = fs.readFileSync(require.resolve('../ai-monitor-ui.js'), 'utf8');
  const tile = source.match(/const tile = (`[^\n]+`);/)?.[1];
  assert.ok(tile, 'AI session tile must exist');
  const context = { working: false, MARK: '', where: 'Opslaan' };
  const html = vm.runInNewContext(tile, context);
  assert.match(html, /<[^>]+data-user-content[^>]*>Opslaan<\//);
});

test('AI questions, choices, code and terminal output are marked as provider content', () => {
  const source = fs.readFileSync(require.resolve('../ai-monitor-ui.js'), 'utf8');
  const panels = source.slice(source.indexOf('  const KEYWORDS ='), source.indexOf('  let claudeTall'));
  const questions = source.slice(source.indexOf('  let askKey ='), source.indexOf('  function bindAsk'));
  const context = { escape: String, T: (_nl, en) => en, pending: false };
  vm.runInNewContext(panels + '\n' + questions + '\nglobalThis.render = { codePanel, termPanel, askForm };', context);
  const code = context.render.codePanel({ file: 'Opslaan', lines: [{ t: '+', text: 'Opslaan' }] });
  const terminal = context.render.termPanel({ command: 'Opslaan', out: ['Opslaan'] });
  const ask = context.render.askForm({ sessionId: '1', ask: [{ header: 'Opslaan', question: 'Opslaan', options: [{ label: 'Opslaan', description: 'Opslaan' }] }] });
  assert.match(code, /data-user-content[^>]*>Opslaan/);
  assert.match(code, /<code data-user-content>/);
  assert.match(terminal, /data-user-content[^>]*>Opslaan/);
  assert.match(terminal, /class="lv-out" data-user-content>Opslaan/);
  assert.match(ask, /class="am-said" data-user-content/);
  assert.match(ask, /class="am-option [^"]*"\s+(?:aria-pressed="(?:true|false)"\s+)?data-user-content/);
});

test('AI plans, browser questions and window titles are protected from translation', () => {
  const source = fs.readFileSync(require.resolve('../ai-monitor-ui.js'), 'utf8');
  assert.match(source, /class="gl-card gl-scroll am-plan" data-user-content/);
  assert.match(source, /class="am-question" data-user-content/);
  assert.match(source, /class="am-hint am-source" data-user-content/);
  assert.match(source, /class="am-window" data-user-content/);
});

test('English UI translates input placeholders while preserving the typed value', () => {
  let callback; const attributes = new Map([['placeholder', 'Opslaan']]);
  const input = { nodeType: 1, value: 'Opslaan', closest: selector => selector.split(',').includes('input'),
    hasAttribute: key => attributes.has(key), getAttribute: key => attributes.get(key),
    setAttribute: (key, value) => attributes.set(key, value), removeAttribute: key => attributes.delete(key) };
  const context = { window: {}, text() {}, document: { body: {}, createTreeWalker: () => ({ nextNode: () => null }) },
    NodeFilter: { SHOW_TEXT: 4, SHOW_ELEMENT: 1 }, setInterval() {},
    MutationObserver: class { constructor(fn) { callback = fn; } observe() {} takeRecords() {} } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../i18n-ui.js'), 'utf8'), context);
  callback([{ type: 'childList', addedNodes: [input] }]);
  assert.equal(attributes.get('placeholder'), 'Save'); assert.equal(input.value, 'Opslaan');
});
test('native UI copy is English even with old Dutch preferences', () => {
  const { text, dictionaries } = require('../orix-copy.cjs');
  assert.deepEqual(Object.keys(dictionaries), ['en']);
  assert.equal(text('nl', 'showLayer'), 'Show desktop layer');
  assert.equal(text('fr', 'settings'), 'Settings');
  assert.equal(text('nl', 'starting'), 'ORIX is starting.');
  assert.equal(text('en', 'unknown'), '');
});

test('legacy settings rows always translate into English', () => {
  const node = { nodeType: 3, nodeValue: 'Opslaan', parentElement: { closest: () => false } };
  const root = { nodeType: 1, closest: () => false, hasAttribute: () => false };
  const context = { window: { __twocodePrefs: () => ({ lang: 'en' }) }, text() {},
    document: { body: root, createTreeWalker: () => { let read = false; return { nextNode: () => read ? null : (read = true, node) }; } },
    NodeFilter: { SHOW_TEXT: 4, SHOW_ELEMENT: 1 }, setInterval() {},
    MutationObserver: class { observe() {} takeRecords() {} } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../i18n-ui.js'), 'utf8'), context);
  for (let i = 0; i < 2; i++) {
    context.window.__twocodeTranslateTree(root, 'en'); assert.equal(node.nodeValue, 'Save');
    context.window.__twocodeTranslateTree(root, 'nl'); assert.equal(node.nodeValue, 'Save');
    assert.equal(context.window.__twocodeLang(), 'en', 'draft translation must not change the layer language');
  }
});

test('ChatGPT login dialog uses ORIX and the committed language without altering the device code', async () => {
  const source = fs.readFileSync(require.resolve('../chatgpt-provider.js'), 'utf8');
  const start = source.indexOf('const choice = await dialog.showMessageBox(');
  const script = source.slice(start, source.indexOf('if (', start));
  for (const lang of ['en', 'nl']) {
    let options;
    await vm.runInNewContext('(async () => {' + script + '})()', { app: { orixLanguage: lang },
      text: require('../orix-copy.cjs').text, result: { userCode: 'SYNTHETIC-CODE' },
      dialog: { showMessageBox: async value => { options = value; return { response: 1 }; } } });
    assert.match(options.title, /ORIX/); assert.doesNotMatch(options.detail, /TwoCode/);
    assert.ok(options.message.endsWith('SYNTHETIC-CODE'));
    assert.equal(options.buttons[1], 'Cancel');
  }
});
