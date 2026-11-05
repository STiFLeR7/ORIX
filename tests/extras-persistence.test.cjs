const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const appRequire = require('node:module').createRequire(path.resolve(__dirname, '../extras-main.cjs'));

function fixture(t, existingFolder, start = false) {
  const folder = existingFolder || fs.mkdtempSync(path.join(os.tmpdir(), 'orix-extras-write-'));
  if (!existingFolder) t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  fs.writeFileSync(path.join(folder, 'note.json'), JSON.stringify({ text: 'Previous note' }));
  fs.writeFileSync(path.join(folder, 'extras.json'), JSON.stringify({ city: 'Old city', calendarUrl: '' }));
  let failure = null; const handlers = new Map(), events = new Map();
  const storage = { ...fs, readFileSync(...args) { if (failure === 'read' && path.basename(args[0]) === 'note.json') throw new Error('Private filesystem path'); return fs.readFileSync(...args); },
    writeFileSync(...args) { if (failure === 'write') throw new Error('Private filesystem path'); return fs.writeFileSync(...args); },
    renameSync(...args) { if (failure === 'rename') throw new Error('Private filesystem path'); return fs.renameSync(...args); } };
  const opened = [], polls = []; let clipboardText = '', reads = 0;
  const electron = { clipboard: { readText() { reads++; return clipboardText; }, writeText(text) { clipboardText = text; } }, globalShortcut: { register() {}, unregister() {} }, session: { defaultSession: { setDisplayMediaRequestHandler() {} } }, shell: { async openPath(file) { opened.push(file); return ''; } }, nativeImage: { createFromDataURL: () => 'icon' }, app: { getPath: () => folder, on() {}, whenReady: () => ({ then(fn) { if (start) fn(); } }) },
    ipcMain: { on: (channel, fn) => events.set(channel, fn), handle: (channel, fn) => handlers.set(channel, fn) }, BrowserWindow: { getAllWindows: () => [] } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../extras-main.cjs'), 'utf8'), {
    module: { exports: {} }, __dirname: path.resolve(__dirname, '..'), process: { versions: { electron: '44.10.1' }, env: {}, platform: 'linux' },
    require: name => name === 'electron' ? electron : name === 'node:fs' ? storage : appRequire(name),
    setInterval(fn, ms) { if (ms === 1000) polls.push(fn); return { unref() {} }; }, clearInterval() {}, setTimeout() {}, clearTimeout, console
  });
  const drags = []; const sender = { getURL: () => pathToFileURL(path.resolve(__dirname, '../mascot.html')).href, mainFrame: {}, startDrag: data => drags.push(data) };
  const event = { sender, senderFrame: sender.mainFrame };
  return { folder, opened, drags, writeClipboard: fn => { electron.clipboard.writeText = fn; }, drag: (file, main) => events.get('extras:tray-drag')({ sender, senderFrame: main ? sender.mainFrame : {} }, file), subframe: (channel, payload) => handlers.get(channel)({ sender, senderFrame: {} }, payload), poll: () => polls[0](), reads: () => reads, clipboard: text => { clipboardText = text; }, foreign: (channel, payload) => handlers.get(channel)({ sender: { getURL: () => 'https://example.invalid' } }, payload), fail: value => { failure = value; }, call: (channel, payload) => handlers.get(channel)(event, payload) };
}

for (const failure of ['write', 'rename']) test(`note ${failure} failure preserves the previous note and reports failure until retry`, async t => {
  const f = fixture(t); f.fail(failure);
  const result = await f.call('extras:note-set', { text: 'New note' });
  assert.equal(result.ok, false); assert.doesNotMatch(result.error, /Private filesystem path/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.folder, 'note.json'))).text, 'Previous note');
  assert.equal(fs.existsSync(path.join(f.folder, 'note.json.tmp')), false);
  f.fail(null); assert.equal((await f.call('extras:note-set', { text: 'New note' })).ok, true);
  assert.equal((await f.call('extras:note-get')).text, 'New note');
});

test('failed extras persistence keeps committed config; invalid calendar errors are English', async t => {
  const f = fixture(t); f.fail('write');
  assert.equal((await f.call('extras:config', { city: 'New city' })).ok, false);
  assert.equal((await f.call('extras:config')).config.city, 'Old city');
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.folder, 'extras.json'))).city, 'Old city');
  f.fail(null); const invalid = await f.call('extras:config', { calendarUrl: 'file:///private.ics' });
  assert.equal(invalid.ok, false); assert.match(invalid.error, /Paste an https or webcal/);
  assert.equal((await f.call('extras:config', { city: 'New city' })).config.city, 'New city');
});

test('a failed note read reports an error instead of acknowledging an empty note', async t => {
  const f = fixture(t); f.fail('read'); const result = await f.call('extras:note-get');
  assert.equal(result.ok, false); assert.match(result.error, /Could not load/); assert.doesNotMatch(result.error, /Private/);
  f.fail(null); assert.equal((await f.call('extras:note-get')).text, 'Previous note');
});

test('failed tray persistence leaves its committed list intact', async t => {
  const f = fixture(t), sample = path.join(f.folder, 'sample.txt'); fs.writeFileSync(sample, 'synthetic');
  f.fail('write'); assert.equal((await f.call('extras:tray-add', { paths: [sample] })).ok, false);
  assert.equal((await f.call('extras:tray-get')).files.length, 0);
  f.fail(null); assert.equal((await f.call('extras:tray-add', { paths: [sample] })).files.length, 1);
  f.fail('rename'); assert.equal((await f.call('extras:tray-remove', { path: sample })).ok, false);
  assert.equal((await f.call('extras:tray-get')).files.length, 1);
});

for (const saved of [JSON.stringify({ unexpected: 'content' }), '{invalid']) test('invalid tray data is preserved and cannot be silently overwritten', async t => {
  const first = fixture(t);
  fs.writeFileSync(path.join(first.folder, 'tray.json'), saved);
  const restarted = fixture(t, first.folder);
  const sample = path.join(first.folder, 'sample.txt'); fs.writeFileSync(sample, 'synthetic');
  const result = await restarted.call('extras:tray-get');
  assert.equal(result.ok, false); assert.match(result.error, /tray/i);
  assert.equal((await restarted.call('extras:tray-add', { paths: [sample] })).ok, false);
  assert.equal((await restarted.call('extras:tray-remove', { path: sample })).ok, false);
  assert.equal(fs.readFileSync(path.join(first.folder, 'tray.json'), 'utf8'), saved);
});

test('an empty tray displays its load error', () => {
  const source = fs.readFileSync(require.resolve('../extras-ui.js'), 'utf8');
  const render = source.slice(source.indexOf('  function render() {'), source.indexOf('  // ---------- quick mirror'));
  const root = { innerHTML: '', querySelectorAll: () => [] };
  vm.runInNewContext(render + '\nrender();', { root, currentView: 'tray', trayFiles: [], trayError: 'Could not load tray', window: { __twocodePrefs: () => ({ lang: 'en' }) }, esc: String });
  assert.match(root.innerHTML, /Could not load tray/);
});

test('tray load failure is passed to the renderer and clears after a successful reload', async () => {
  const source = fs.readFileSync(require.resolve('../extras-ui.js'), 'utf8');
  const loader = source.slice(source.indexOf('  async function loadTray()'), source.indexOf('  window.__twocodeTrayReload'));
  let response = { ok: false, error: 'Could not load tray' }, renders = 0;
  const context = { api: { trayGet: async () => response }, trayFiles: [], trayError: '', render: () => renders++ };
  vm.runInNewContext(loader, context);
  await context.loadTray(); assert.equal(context.trayError, 'Could not load tray');
  response = { ok: true, files: [] }; await context.loadTray();
  assert.equal(context.trayError, ''); assert.equal(renders, 2);
});

test('tray persists disposable files across restart, opens listed files and removes them without deleting the file', async t => {
  const first = fixture(t), sample = path.join(first.folder, 'sample.txt');
  fs.writeFileSync(sample, 'synthetic');
  assert.equal((await first.call('extras:tray-add', { paths: [sample, sample, 'relative.txt'] })).files.length, 1);
  const restarted = fixture(t, first.folder);
  assert.equal((await restarted.call('extras:tray-get')).files[0].path, sample);
  assert.equal((await restarted.call('extras:tray-open', { path: sample })).ok, true);
  assert.deepEqual(restarted.opened, [sample]);
  assert.equal((await restarted.call('extras:tray-open', { path: path.join(first.folder, 'other.txt') })).ok, false);
  assert.equal((await restarted.call('extras:tray-remove', { path: sample })).files.length, 0);
  assert.equal(fs.readFileSync(sample, 'utf8'), 'synthetic');
  assert.equal((await fixture(t, first.folder).call('extras:tray-get')).files.length, 0);
});

test('clipboard polling remains disabled until enabled and stops immediately on disable', async t => {
  const f = fixture(t, undefined, true); f.clipboard('synthetic');
  f.poll(); await new Promise(resolve => setImmediate(resolve)); assert.equal(f.reads(), 0);
  assert.equal((await f.call('extras:clips-enabled', { enabled: true })).ok, true);
  f.poll(); await new Promise(resolve => setImmediate(resolve)); assert.equal(f.reads(), 1);
  assert.equal((await f.call('extras:clips-get')).clips[0].text, 'synthetic');
  assert.equal((await f.call('extras:clips-enabled', { enabled: false })).ok, true);
  f.clipboard('other'); f.poll(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.reads(), 1); assert.equal((await f.call('extras:clips-get')).clips.length, 0);
  assert.equal((await f.call('extras:clips-enabled', { enabled: 'yes' })).ok, false);
});

test('disabling clipboard collection rejects an in-flight read and untrusted requests', async t => {
  const f = fixture(t, undefined, true); let finish;
  f.clipboard(new Promise(resolve => { finish = resolve; }));
  assert.equal((await f.foreign('extras:clips-enabled', { enabled: true })).ok, false);
  await f.call('extras:clips-enabled', { enabled: true }); f.poll();
  await f.call('extras:clips-enabled', { enabled: false }); finish('late synthetic text');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal((await f.call('extras:clips-get')).clips.length, 0);
});

test('an asynchronous clipboard write failure reports failure and preserves history order', async t => {
  const f = fixture(t, undefined, true);
  await f.call('extras:clips-enabled', { enabled: true });
  for (const text of ['first', 'second']) {
    f.clipboard(text); f.poll(); await new Promise(resolve => setImmediate(resolve));
  }
  const failure = Promise.reject(new Error('Clipboard unavailable'));
  failure.catch(() => {});
  f.writeClipboard(() => failure);
  const result = await f.call('extras:clips-copy', { index: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'Clipboard unavailable');
  assert.equal((await f.call('extras:clips-get')).clips[0].text, 'second');
});

test('disabling clipboard collection during a copy keeps history cleared', async t => {
  const f = fixture(t, undefined, true);
  await f.call('extras:clips-enabled', { enabled: true });
  f.clipboard('sample'); f.poll(); await new Promise(resolve => setImmediate(resolve));
  let finish;
  f.writeClipboard(() => new Promise(resolve => { finish = resolve; }));
  const copying = f.call('extras:clips-copy', { index: 0 });
  await f.call('extras:clips-enabled', { enabled: false });
  finish();
  assert.equal((await copying).clips.length, 0);
  assert.equal((await f.call('extras:clips-get')).clips.length, 0);
});

test('tray file controls expose keyboard-operable open and visible remove buttons', async () => {
  const source = fs.readFileSync(require.resolve('../extras-ui.js'), 'utf8');
  const render = source.slice(source.indexOf('  function render() {'), source.indexOf('  // ---------- quick mirror'));
  const root = { innerHTML: '', querySelectorAll: () => [] };
  const context = { root, currentView: 'tray', trayFiles: [{ name: 'fixture.txt', path: 'C:\\fixture.txt', size: 10 }], trayError: '', window: { __twocodePrefs: () => ({ lang: 'en' }) }, esc: String };
  vm.runInNewContext(render + '\nrender();', context);
  assert.match(root.innerHTML, /<button\b[^>]*class="ex-open"[^>]*>/);
  assert.match(root.innerHTML, /<button\b[^>]*class="ex-x"/);
  assert.match(source, /\.ex-x:focus-visible\s*\{/);
});

test('extras IPC refuses a subframe even when the parent URL is trusted', async t => {
  const f = fixture(t, undefined, true); f.clipboard('synthetic');
  assert.equal((await f.subframe('extras:clips-enabled', { enabled: true })).ok, false);
  f.poll(); assert.equal(f.reads(), 0);
  assert.equal((await f.subframe('extras:note-get')).ok, false);
  assert.equal((await f.call('extras:note-get')).text, 'Previous note');
});

test('tray drag only starts from the desktop main frame', async t => {
  const f = fixture(t), sample = path.join(f.folder, 'drag.txt'); fs.writeFileSync(sample, 'synthetic');
  assert.equal((await f.call('extras:tray-add', { paths: [sample] })).ok, true);
  f.drag(sample, false); assert.equal(f.drags.length, 0);
  f.drag(sample, true); assert.equal(f.drags.length, 1); assert.equal(f.drags[0].file, sample);
});
