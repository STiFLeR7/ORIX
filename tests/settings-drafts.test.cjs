const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const appearance = require('../src/orix-appearance-ui.js');
const appRequire = require('node:module').createRequire(require('node:path').resolve(__dirname, '../src/settings-app-main.cjs'));

function bridge(initialOff = []) {
  let prefs = { lang: 'en', themeMode: 'dark', motionMode: 'system', name: 'Keep', lightBusy: '#ff9a1f' }, preview, failSave = false;
  let failModules = false, saveServices = async () => {};
  const buttons = [], inputs = new Map();
  const values = new Map([['orix:apps-off', JSON.stringify(initialOff)]]), clipboardCalls = []; let clipboardFailure = false;
  const box = { innerHTML: '', setAttribute() {}, querySelector: selector => inputs.get(selector) || null,
    querySelectorAll: selector => selector === 'button' ? buttons : inputs.has(selector) ? [inputs.get(selector)] : [] };
  const window = { orix: { clipsSetEnabled: async enabled => { clipboardCalls.push(enabled); return { ok: !clipboardFailure }; } }, ORIXAppearance: appearance, __orixSettingsHtml: () => '', __orixRealPrefs: () => ({ ...prefs }),
    __orixPrefs: () => prefs, __orixPreviewPrefs: p => { preview = p ? { ...p } : null; },
    __orixWithDraft: (_prefs, fn) => fn(), __orixSaveDraft: p => { if (failSave) throw new Error('Save failed'); prefs = { ...p }; },
    __orixSaveSettingsServices: (...args) => saveServices(...args) };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/settings-bridge-ui.js'), 'utf8'), {
    window, document: { getElementById: () => ({ appendChild() {} }), createElement: () => box, querySelectorAll: () => [] },
    setView() {}, sleepEnabled: false, performance: { now: () => 0 },
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => { if (failModules && key === 'orix:apps-off') throw new Error('Storage unavailable'); values.set(key, value); } },
    setTimeout: callback => { callback(); return 1; }
  });
  const call = req => window.__orixRemoteSettings(req);
  return { call, prefs: () => prefs, preview: () => preview, fail: () => { failSave = true; }, external: value => Object.assign(prefs, value),
    failModules: value => { failModules = value; }, modules: () => window.__orixAppsOff(),
    storedModules: () => JSON.parse(values.get('orix:apps-off')), clipboardCalls, failClipboard: value => { clipboardFailure = value; },
    services: fn => { saveServices = fn; },
    extra: (key, value) => { inputs.set('#tc-in-' + key, { value, setAttribute() {} }); buttons[0] = { dataset: { save: '1', pref: key } }; return call({ kind: 'click', index: 0 }); },
    startup: () => { buttons[0] = { dataset: { login: '1' }, classList: { contains: () => false } }; return call({ kind: 'click', index: 0 }); } };
}
test('appearance changes preview as drafts, Save persists and Discard restores committed values', async () => {
  const b = bridge();
  let r = await b.call({ kind: 'appearance', values: { themeMode: 'light', lang: 'en' } });
  assert.equal(r.info.dirty, true); assert.equal(r.info.lang, 'en');
  assert.equal(b.prefs().themeMode, 'dark'); assert.equal(b.preview().themeMode, 'light');
  r = await b.call({ kind: 'discard' }); assert.equal(r.info.dirty, false); assert.equal(r.info.lang, 'en');
  assert.equal(b.preview(), null);
  await b.call({ kind: 'appearance', values: { themeMode: 'system', motionMode: 'reduced', lang: 'en' } });
  r = await b.call({ kind: 'save' });
  assert.equal(r.info.dirty, false); assert.equal(b.prefs().lang, 'en');
  assert.equal(b.prefs().name, 'Keep'); assert.equal(b.prefs().lightBusy, '#ff9a1f');
});
test('invalid appearance and failed persistence leave committed preferences intact', async () => {
  const b = bridge();
  const invalid = await b.call({ kind: 'appearance', values: { lang: 'xx' } }); assert.equal(invalid.ok, false);
  await b.call({ kind: 'appearance', values: { themeMode: 'light' } }); b.fail();
  await assert.rejects(b.call({ kind: 'save' }), /Save failed/);
  assert.equal(b.prefs().themeMode, 'dark');
  const state = await b.call({ kind: 'appearance', values: {} }); assert.equal(state.info.dirty, true);
});

test('background preference changes do not dirty a settings draft or get overwritten by Save', async () => {
  const b = bridge(); await b.call({ kind: 'list' });
  b.external({ focusMin: 5 });
  assert.equal((await b.call({ kind: 'list' })).info.dirty, false);
  await b.call({ kind: 'appearance', values: { themeMode: 'light', lang: 'en' } });
  b.external({ focusMin: 15, name: 'Changed elsewhere' });
  await b.call({ kind: 'save' });
  assert.equal(b.prefs().themeMode, 'light'); assert.equal(b.prefs().lang, 'en');
  assert.equal(b.prefs().focusMin, 15); assert.equal(b.prefs().name, 'Changed elsewhere');
});

test('failed module persistence retains the old modules and dirty draft for retry', async () => {
  const b = bridge(); await b.call({ kind: 'app', id: 'focus', on: false }); b.failModules(true);
  await assert.rejects(b.call({ kind: 'save' }), /module|Storage/i);
  assert.equal(b.modules().has('focus'), false);
  assert.equal((await b.call({ kind: 'apps' })).info.dirty, true);
  b.failModules(false); await b.call({ kind: 'save' });
  assert.equal(b.modules().has('focus'), true);
  assert.equal((await b.call({ kind: 'apps' })).info.dirty, false);
});

test('Save waits for extras and keeps failed or slow writes recoverable', async () => {
  const b = bridge(); await b.extra('calendarUrl', 'invalid://calendar');
  let rejectWrite; b.services(() => new Promise((_resolve, reject) => { rejectWrite = reject; }));
  let settled = false; const pending = b.call({ kind: 'save' }); pending.then(() => { settled = true; }, () => { settled = true; });
  await new Promise(resolve => setImmediate(resolve)); assert.equal(settled, false);
  rejectWrite(new Error('Paste an https or webcal calendar link.'));
  await assert.rejects(pending, /https/);
  assert.equal((await b.call({ kind: 'apps' })).info.dirty, true);
  b.services(async () => {}); await b.call({ kind: 'save' });
  assert.equal((await b.call({ kind: 'apps' })).info.dirty, false);
});

test('failed startup persistence retains its settings draft', async () => {
  const b = bridge(); await b.startup();
  b.services(async (_extras, login) => { assert.equal(login, true); throw new Error('Could not change startup.'); });
  await assert.rejects(b.call({ kind: 'save' }), /startup/);
  assert.equal((await b.call({ kind: 'apps' })).info.dirty, true);
});

test('settings service writes update caches only after successful awaited IPC', async () => {
  const source = fs.readFileSync(require.resolve('../src/orix-fun.js'), 'utf8');
  const start = source.indexOf('window.__orixSaveSettingsServices =');
  assert.notEqual(start, -1, 'awaitable settings service writer is required');
  let configResult = { ok: false, error: 'Paste an https or webcal calendar link.' }, loginResult = { ok: false };
  const context = { window: { orix: { extrasConfig: async () => configResult, loginSet: async () => loginResult } },
    extrasCfg: { city: 'Old' }, extrasError: '', loginOn: false, rerender() {} };
  vm.runInNewContext(source.slice(start, source.indexOf('window.__orixSettingsAction =', start)), context);
  await assert.rejects(context.window.__orixSaveSettingsServices({ calendarUrl: 'invalid://' }, null), /https/);
  assert.equal(context.extrasCfg.city, 'Old');
  configResult = { ok: true, config: { city: 'New' } };
  await assert.rejects(context.window.__orixSaveSettingsServices({ city: 'New' }, true), /startup/i);
  assert.equal(context.loginOn, false);
  loginResult = { ok: true, on: true }; await context.window.__orixSaveSettingsServices({}, true);
  assert.equal(context.loginOn, true); assert.equal(context.extrasError, '');
});

test('main relay validates appearance values before evaluating a request in the island', async () => {
  const handlers = new Map(), requests = [], windows = []; let visible = true, toolShown = false;
  const island = { isDestroyed: () => false, webContents: { getURL: () => 'file:///app/mascot.html',
    send: (channel, view) => requests.push([channel, view]), executeJavaScript: async script => { requests.push(script); return { info: { lang: 'en', dirty: true } }; } },
    showInactive() { toolShown = true; }, focus() {}, isMinimized: () => false };
  class Window {
    constructor() { this.webContents = { mainFrame: {}, setWindowOpenHandler() {}, send() {} }; windows.push(this); }
    static getAllWindows() { return [island]; }
    isDestroyed() { return false; } setMenuBarVisibility() {} setAppDetails() {} loadFile() {} once() {} on() {}
  }
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/settings-app-main.cjs'), 'utf8'), {
    module: mod, __dirname: require('node:path').resolve(__dirname, '../src'), process: { argv: [], env: {}, platform: 'win32', execPath: 'ORIX.exe' },
    require: name => name === './orix-layer-main.cjs' ? { findIsland: () => island, trusted: e => e.senderFrame === e.sender?.mainFrame, isVisible: () => visible, reveal: view => { toolShown = true; requests.push(['extras:shortcut', view]); return true; } } : name === 'electron' ? { app: { on() {} }, BrowserWindow: Window,
      ipcMain: { on() {}, handle: (key, fn) => handlers.set(key, fn) } } : appRequire(name)
  });
  mod.exports.open(); const get = handlers.get('settings-app:get'), event = { sender: windows[0].webContents, senderFrame: windows[0].webContents.mainFrame };
  const bad = await get(event, { kind: 'appearance', values: { lang: 'fr', themeMode: 'light' } });
  assert.equal(bad.ok, false); assert.equal(requests.length, 0);
  assert.equal((await get(event, { kind: 'appearance', values: { lang: 'nl' } })).ok, false);
  await get(event, { kind: 'appearance', values: { lang: 'en', themeMode: 'system' } });
  assert.match(requests[0], /"kind":"appearance"/); assert.match(requests[0], /"lang":"en"/);
  const tool = handlers.get('settings-app:tool');
  assert.equal(tool(event, 'unexpected').ok, false);
  assert.equal(tool({ sender: {} }, 'note').ok, false);
  visible = false; assert.equal(tool(event, 'note').ok, false); assert.equal(toolShown, false);
  visible = true; assert.equal(tool(event, 'note').ok, true); assert.equal(toolShown, true);
  assert.deepEqual(requests.at(-1), ['extras:shortcut', 'note']);
  assert.equal(tool(event, 'ai-settings').ok, true);
  assert.deepEqual(requests.at(-1), ['extras:shortcut', 'ai-settings']);
});
test('dashboard does not announce success or clear a draft after a failed save', async () => {
  const source = fs.readFileSync(require.resolve('../src/settings-app.html'), 'utf8');
  const start = source.indexOf('async function saveAll()');
  const script = source.slice(start, source.indexOf('async function cancelAll()', start));
  const messages = [], button = { disabled: false };
  const context = { $: () => button, S: { get: async () => ({ ok: false, error: 'Storage unavailable' }) },
    tab: 'general', lastHtml: '', render: async () => {}, showInfo() {}, updateSave() {},
    t: () => ({ savedAll: 'Saved' }), toast: (...args) => messages.push(args) };
  vm.runInNewContext(script, context); await context.saveAll();
  assert.ok(messages.some(([message]) => message === 'Storage unavailable'));
  assert.equal(messages.some(([message]) => message === 'Saved'), false);
  assert.equal(button.disabled, false);
});
test('new dashboard controls cannot shift legacy delegated settings button indices', () => {
  const source = fs.readFileSync(require.resolve('../src/settings-app.html'), 'utf8');
  const script = source.match(/function islandIndex\(b\) \{[^\n]+\}/)[0];
  const extra = { closest: () => null }, first = { closest: () => null }, second = { closest: () => null };
  const context = { list: { querySelectorAll: selector => selector === '.island-settings button' ? [first, second] : [extra, first, second] } };
  vm.runInNewContext(script, context);
  assert.equal(context.islandIndex(second), 1);
});

test('reopening the dashboard reuses its window and does not register new IPC handlers', () => {
  const handlers = [], listeners = [], windows = [];
  class Window {
    constructor() { this.events = new Map(); this.webContents = { mainFrame: {}, setWindowOpenHandler() {}, send() {} }; windows.push(this); }
    static getAllWindows() { return []; }
    isDestroyed() { return false; } isMinimized() { return false; } setMenuBarVisibility() {} setAppDetails() {} loadFile() {} once() {} show() {} focus() {}
    on(name, fn) { this.events.set(name, fn); }
  }
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/settings-app-main.cjs'), 'utf8'), {
    module: mod, __dirname: require('node:path').resolve(__dirname, '../src'), process: { argv: [], env: {}, platform: 'win32' },
    require: name => name === './orix-layer-main.cjs' ? { findIsland: () => null } : name === 'electron' ? { app: { on: (...args) => listeners.push(args) }, BrowserWindow: Window,
      ipcMain: { on: (...args) => handlers.push(args), handle: (...args) => handlers.push(args) } } : appRequire(name)
  });
  const registrationCount = handlers.length, appListenerCount = listeners.length;
  for (let i = 0; i < 20; i++) {
    mod.exports.open('overview'); mod.exports.open('settings');
    assert.equal(windows.length, i + 1);
    windows[i].events.get('closed')();
  }
  assert.equal(handlers.length, registrationCount);
  assert.equal(listeners.length, appListenerCount);
});

test('closing Settings after a failed Save retains the window and draft', async () => {
  const events = new Map(), dialogs = [], windows = []; let fail = true, closed = 0;
  const island = { isDestroyed: () => false, webContents: { getURL: () => 'file:///app/mascot.html', executeJavaScript: async script => {
    if (!script.includes('RemoteSettings')) return;
    if (fail) throw new Error('Disk unavailable');
    return { info: { dirty: false, lang: 'en' } };
  } } };
  class Window {
    constructor() { this.events = new Map(); this.webContents = { mainFrame: {}, setWindowOpenHandler() {}, send() {} }; windows.push(this); }
    static getAllWindows() { return [island]; }
    isDestroyed() { return false; } setMenuBarVisibility() {} setAppDetails() {} loadFile() {} once() {}
    on(key, fn) { this.events.set(key, fn); } close() { closed++; }
  }
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/settings-app-main.cjs'), 'utf8'), {
    module: mod, __dirname: require('node:path').resolve(__dirname, '../src'), process: { argv: [], env: {}, platform: 'win32' },
    require: name => name === './orix-layer-main.cjs' ? { findIsland: () => island, trusted: e => e.senderFrame === e.sender?.mainFrame } : name === 'electron' ? { app: { on() {} }, BrowserWindow: Window,
      ipcMain: { on: (key, fn) => events.set(key, fn), handle() {} },
      dialog: { showMessageBox: async (_win, options) => { dialogs.push(options); return { response: 0 }; } }
    } : appRequire(name)
  });
  mod.exports.open(); const win = windows[0];
  events.get('settings-app:dirty')({ sender: win.webContents, senderFrame: win.webContents.mainFrame }, true);
  win.events.get('close')({ preventDefault() {} });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(closed, 0, 'failed persistence must not discard the draft');
  assert.equal(dialogs.at(-1).type, 'error');
  assert.match(dialogs.at(-1).message, /Could not save preferences/);
  fail = false;
  win.events.get('close')({ preventDefault() {} });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(closed, 1);
});

test('clipboard collection follows the committed module preference and not drafts', async () => {
  const b = bridge(['clips']); await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(b.clipboardCalls, [false]);
  await b.call({ kind: 'app', id: 'clips', on: true });
  assert.deepEqual(b.clipboardCalls, [false]);
  await b.call({ kind: 'discard' }); assert.deepEqual(b.clipboardCalls, [false]);
  await b.call({ kind: 'app', id: 'clips', on: true }); await b.call({ kind: 'save' });
  assert.deepEqual(b.clipboardCalls, [false, true]);
  await b.call({ kind: 'app', id: 'clips', on: false }); b.failClipboard(true);
  await assert.rejects(b.call({ kind: 'save' }), /clipboard/i);
  assert.equal((await b.call({ kind: 'apps' })).info.dirty, true);
  b.failClipboard(false); await b.call({ kind: 'save' });
  assert.equal(b.modules().has('clips'), true); assert.equal(b.clipboardCalls.at(-1), false);
});

test('failed clipboard enable does not persist an enabled module', async () => {
  const b = bridge(['clips']); await new Promise(resolve => setImmediate(resolve));
  await b.call({ kind: 'app', id: 'clips', on: true }); b.failClipboard(true);
  await assert.rejects(b.call({ kind: 'save' }), /clipboard/i);
  assert.deepEqual(b.storedModules(), ['clips']);
  assert.equal(b.modules().has('clips'), true);
  assert.equal((await b.call({ kind: 'apps' })).info.dirty, true);
});

test('malformed saved module lists do not enable clipboard capture', async () => {
  for (const bad of ['clips', null, { clips: false }, ['focus', 5]]) {
    const b = bridge(bad); await new Promise(resolve => setImmediate(resolve));
    assert.equal(b.clipboardCalls[0], false);
  }
});

test('project AI settings request opens the AI tab instead of General', () => {
  const source = fs.readFileSync(require.resolve('../src/ai-settings-ui.js'), 'utf8');
  const start = source.indexOf("  window.addEventListener('orix:open-ai-settings'");
  const end = source.indexOf('  // Algemeen:', start);
  assert.ok(start >= 0 && end > start);
  let handler, stored, rendered = 0, loaded = 0;
  const context = { window: { addEventListener: (_name, fn) => { handler = fn; } }, localStorage: { setItem: (_key, value) => { stored = value; } }, render: () => rendered++, load: () => loaded++ };
  vm.runInNewContext('let tab = "general", visible = false;\n' + source.slice(start, end) + '\nglobalThis.currentTab = () => tab; globalThis.show = () => { visible = true; };', context);
  handler(); assert.equal(context.currentTab(), 'ai'); assert.equal(stored, 'ai'); assert.equal(rendered, 1); assert.equal(loaded, 0);
  context.show(); handler(); assert.equal(loaded, 1);
});

test('project AI settings bypass the dashboard redirect and expand the layer', () => {
  const bridgeSource = fs.readFileSync(require.resolve('../src/settings-bridge-ui.js'), 'utf8');
  const start = bridgeSource.indexOf('  const openView = setView;');
  const end = bridgeSource.indexOf('  const root = document.getElementById', start);
  let opened, mode;
  const context = { window: { orix: { settingsOpen() {} } }, setView: value => { opened = value; }, setMode: value => { mode = value; }, license: { locked: [] }, performance: { now: () => 0 } };
  vm.runInNewContext(bridgeSource.slice(start, end), context);
  assert.equal(typeof context.window.__orixOpenInlineSettings, 'function');
  context.window.__orixOpenInlineSettings(); assert.equal(opened, 'settings'); assert.equal(mode, 'expanded');
  const project = fs.readFileSync(require.resolve('../src/project-mode-ui.js'), 'utf8');
  const body = project.slice(project.indexOf('  function settings() {'), project.indexOf('  function render() {')); 
  assert.match(body, /__orixOpenInlineSettings/);
});

test('advanced AI settings use English for provider details and key controls', () => {
  const source = fs.readFileSync(require.resolve('../src/ai-settings-ui.js'), 'utf8');
  const start = source.indexOf('  function keyFields(type)'), end = source.indexOf('  const sleepRow', start);
  assert.ok(start >= 0 && end > start);
  const context = { settings: { selectedProvider: 'openai', openai: { hasKey: false } }, loggingIn: false, escape: String, button: label => label };
  vm.runInNewContext(source.slice(start, end), context);
  assert.match(context.details(), /Your OpenAI API key/); assert.match(context.details(), /Save key/);
  context.settings = { selectedProvider: 'chatgpt', chatgpt: { installed: true, ready: false } };
  assert.match(context.details(), /Sign in with ChatGPT/);
  context.settings = { selectedProvider: 'orix', orix: {} };
  assert.match(context.details(), /Developer settings/);
  assert.match(source, /'Use your ChatGPT account'/); assert.match(source, /'Your OpenAI key'/);
});

test('AI settings IPC rejects untrusted windows before invoking sensitive actions', async () => {
  const source = fs.readFileSync(require.resolve('../src/project-mode-main.js'), 'utf8');
  const start = source.indexOf('// AI SETTINGS IPC'), end = source.indexOf('const projectEditor =', start);
  assert.ok(start >= 0 && end > start);
  const handlers = new Map(), calls = [];
  const fn = name => (...args) => { calls.push(name); return { ok: true }; };
  const context = { ipcMain: { handle: (name, handler) => handlers.set(name, handler) }, require: name => name === './orix-layer-main.cjs' ? { trusted: event => event.trusted === true } : appRequire(name),
    getPublicAISettings: fn('get'), setAIProvider: fn('provider'), saveAIKey: fn('key'), clearAIKey: fn('clear'), setOpenAIModel: fn('model'), testSelectedAI: fn('test'),
    chatgpt: { login: fn('login'), cancelLogin: fn('cancel'), logout: fn('logout') } };
  vm.runInNewContext(source.slice(start, end), context);
  assert.equal(handlers.size, 9);
  for (const handler of handlers.values()) { const result = await handler({ trusted: false }, {}); assert.equal(result.ok, false); }
  assert.deepEqual(calls, []);
  const result = await handlers.get('ai-settings:set-provider')({ trusted: true }, 'openai');
  assert.equal(result.ok, true); assert.deepEqual(calls, ['provider']);
});

test('project IPC rejects untrusted requests before calling project operations', async () => {
  const source = fs.readFileSync(require.resolve('../src/project-mode-main.js'), 'utf8');
  const start = source.indexOf('// PROJECT IPC'), end = source.indexOf('// AI SETTINGS IPC', start);
  const handlers = new Map(), calls = [];
  const f = name => () => { calls.push(name); return { ok: true }; };
  const context = { ipcMain: { handle: (name, handler) => handlers.set(name, handler) }, require: name => name === './orix-layer-main.cjs' ? { trusted: e => e.trusted === true } : appRequire(name),
    loadProjectPath: () => { calls.push('get'); return null; }, chooseProject: f('choose'), listProjectFiles: f('list'), aiStatus: f('status'), getProjectChat: f('chat'), sendProjectChat: f('send'), resetProjectChat: f('reset') };
  vm.runInNewContext(source.slice(start, end), context);
  assert.equal(handlers.size, 7);
  for (const handler of handlers.values()) assert.equal((await handler({ trusted: false }, {})).ok, false);
  assert.deepEqual(calls, []); assert.equal((await handlers.get('projectv2:choose')({ trusted: true })).ok, true); assert.deepEqual(calls, ['choose']);
});

test('agent and editor IPC wrappers reject untrusted requests before invoking actions', async () => {
  for (const [file, name, end] of [['../src/project-agent-main.js', 'handle', "  handle('project-agent:get'"], ['../src/project-editor-main.js', 'handler', "  handler('project-editor:open'"]]) {
    const source = fs.readFileSync(require.resolve(file), 'utf8'), start = source.indexOf(`  function ${name}(name, fn) {`), stop = source.indexOf(end, start);
    assert.ok(start >= 0 && stop > start); let handler, calls = 0;
    const context = { ipcMain: { handle: (_name, fn) => { handler = fn; } }, require: request => request === './orix-layer-main.cjs' ? { trusted: e => e.trusted === true } : appRequire(request) };
    vm.runInNewContext(source.slice(start, stop) + `\n${name}('fixture', () => { globalThis.calls++; return { ok: true }; });`, Object.assign(context, { calls }));
    assert.equal((await handler({ trusted: false }, {})).ok, false); assert.equal(context.calls, 0);
    assert.equal((await handler({ trusted: true }, {})).ok, true); assert.equal(context.calls, 1);
  }
});

test('legacy project, Spotify and window IPC reject foreign renderers', async () => {
  const source = fs.readFileSync(require.resolve('../src/main.js'), 'utf8');
  const start = source.indexOf('// ORIX IPC'), end = source.indexOf('// Goodbye:', start);
  assert.ok(start >= 0 && end > start);
  const handlers = new Map(), events = new Map(), calls = [];
  const action = name => (...args) => { calls.push(name); return { ok: true }; };
  const context = { ipcMain: { handle: (name, fn) => handlers.set(name, fn), on: (name, fn) => events.set(name, fn) }, desktopLayer: { trusted: e => e.trusted === true }, app: { quit: action('quit') },
    connectToORIX: action('connect'), getConnection: action('connection'), getORIXState: action('state'), getCurrentProject: action('project'), chooseProject: action('choose'), searchProject: action('search'), readProjectFile: action('read'),
    spotifyConnect: action('spotifyConnect'), getSpotifyState: action('spotifyState'), spotifyControl: action('spotifyControl'), spotifyDevices: action('spotifyDevices'), spotifyTransfer: action('spotifyTransfer'), spotifySeek: action('spotifySeek'), clearSpotifyTokens: action('spotifyDisconnect'), setMascotInteractive: action('interactive'), interactiveHeardAt: 0 };
  vm.runInNewContext(source.slice(start, end), context);
  assert.equal(handlers.size, 15);
  for (const fn of handlers.values()) assert.equal((await fn({ trusted: false }, {})).ok, false);
  for (const fn of events.values()) fn({ trusted: false }, true);
  assert.deepEqual(calls, []);
  assert.equal((await handlers.get('spotify:control')({ trusted: true }, 'play')).ok, true);
  events.get('island:set-interactive')({ trusted: true }, true);
  events.get('window:close')({ trusted: true });
  assert.deepEqual(calls, ['spotifyControl', 'interactive', 'quit']);
});


test('cancelling a Settings close clears a pending restart request', async () => {
  const events = new Map(), windows = []; let response = 2, closes = 0, quits = 0;
  const app = { orixRestartRequested: true, on() {}, quit() { quits++; } };
  const island = { isDestroyed: () => false, webContents: { executeJavaScript: async () => ({ info: { dirty: true } }) } };
  class Window {
    constructor() { this.events = new Map(); this.webContents = { mainFrame: {}, setWindowOpenHandler() {}, send() {} }; windows.push(this); }
    static getAllWindows() { return [island]; }
    isDestroyed() { return false; } setMenuBarVisibility() {} setAppDetails() {} loadFile() {} once() {} on(k, f) { this.events.set(k, f); } close() { closes++; }
  }
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/settings-app-main.cjs'), 'utf8'), {
    module: mod, __dirname: require('node:path').resolve(__dirname, '../src'), process: { argv: [], env: {}, platform: 'win32' },
    require: name => name === './orix-layer-main.cjs' ? { findIsland: () => island, trusted: e => e.senderFrame === e.sender?.mainFrame } : name === 'electron' ? { app, BrowserWindow: Window,
      ipcMain: { on: (key, fn) => events.set(key, fn), handle() {} }, dialog: { showMessageBox: async () => ({ response }) } } : appRequire(name)
  });
  mod.exports.open(); const win = windows[0]; events.get('settings-app:dirty')({ sender: win.webContents, senderFrame: win.webContents.mainFrame }, true);
  win.events.get('close')({ preventDefault() {} }); await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.orixRestartRequested, false); assert.equal(quits, 0);
  app.orixRestartRequested = true; response = 1;
  win.events.get('close')({ preventDefault() {} }); await new Promise(resolve => setImmediate(resolve));
  assert.equal(closes, 1); assert.equal(quits, 1);
});


test('shutdown asks about a Settings draft before closing its windows', async () => {
  const events = new Map(), windows = []; let response = 2, closes = 0, requested = [], fail = false;
  const app = { on() {} };
  const island = { isDestroyed: () => false, webContents: { executeJavaScript: async script => {
    if (script.includes('RemoteSettings')) { requested.push(script); if (fail) throw Error('Disk unavailable'); }
    return { info: { dirty: false } };
  } } };
  class Window {
    constructor() { this.events = new Map(); this.webContents = { mainFrame: {}, setWindowOpenHandler() {}, send() {} }; windows.push(this); }
    static getAllWindows() { return [island]; }
    isDestroyed() { return false; } setMenuBarVisibility() {} setAppDetails() {} loadFile() {} once() {} on(k, f) { this.events.set(k, f); } close() { closes++; }
  }
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/settings-app-main.cjs'), 'utf8'), {
    module: mod, __dirname: require('node:path').resolve(__dirname, '../src'), process: { argv: [], env: {}, platform: 'win32' },
    require: name => name === './orix-layer-main.cjs' ? { findIsland: () => island, trusted: e => e.senderFrame === e.sender?.mainFrame } : name === 'electron' ? { app, BrowserWindow: Window,
      ipcMain: { on: (key, fn) => events.set(key, fn), handle() {} }, dialog: { showMessageBox: async () => ({ response }) } } : appRequire(name)
  });
  mod.exports.open(); const win = windows[0]; events.get('settings-app:dirty')({ sender: win.webContents, senderFrame: win.webContents.mainFrame }, true);
  assert.equal(typeof mod.exports.prepareQuit, 'function');
  assert.equal(await mod.exports.prepareQuit(), false); assert.equal(closes, 0); assert.equal(requested.length, 0);
  response = 1; assert.equal(await mod.exports.prepareQuit(), true); assert.equal(closes, 0); assert.match(requested[0], /discard/);
  events.get('settings-app:dirty')({ sender: win.webContents, senderFrame: win.webContents.mainFrame }, true);
  response = 0; fail = true; assert.equal(await mod.exports.prepareQuit(), false); assert.equal(closes, 0);
  fail = false; assert.equal(await mod.exports.prepareQuit(), true); assert.match(requested.at(-1), /save/);
});
