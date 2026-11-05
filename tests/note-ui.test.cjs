const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');

async function fixture(text = 'My note\n[ ] Ship it', loaded = true) {
  const source = fs.readFileSync(require.resolve('../tools-ui.js'), 'utf8'), events = {}, inputEvents = {}, timers = new Map();
  let serial = 0, result = { ok: false }, focused = false;
  const status = {}, retry = {}, area = { value: text, addEventListener: (key, fn) => { inputEvents[key] = fn; },
    focus: () => { focused = true; }, setSelectionRange() {} };
  const root = { innerHTML: '', addEventListener: (key, fn) => { events[key] = fn; }, contains: () => true,
    querySelector: selector => selector === 'textarea' ? root.innerHTML.includes('<textarea') ? area : null
      : selector === '[data-note-status]' ? status : selector === '[data-note-retry]' ? retry : null };
  const context = { root, currentView: 'note', clips: [], copied: -1, lastRender: '', projectInputFocused: false,
    window: { __twocodePrefs: () => ({ lang: 'en' }) }, document: { activeElement: area }, sendInteractive() {}, sound() {},
    esc: value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;'),
    api: { noteGet: async () => loaded ? { ok: true, text } : { ok: false }, noteSet: async () => result },
    setTimeout: fn => { timers.set(++serial, fn); return serial; }, clearTimeout: id => timers.delete(id) };
  vm.runInNewContext(source.slice(source.indexOf('// ---- note ----'), source.indexOf('// ---- placing the panel ----')) +
    '\nglobalThis.noteState = () => ({ note, savedAt, error: typeof noteError === "undefined" ? "" : noteError });', context);
  await new Promise(resolve => setImmediate(resolve));
  const click = kind => events.click({ detail: 0, target: { closest: selector => selector === kind ? {} : null } });
  return { root, area, status, retry, state: () => context.noteState(), focused: () => focused,
    edit: () => click('[data-edit]'), retrySave: () => click('[data-note-retry]'), result: value => { result = value; },
    pendingInput: value => { area.value = value; inputEvents.input(); }, flush: () => context.window.__orixFlushNote?.(),
    input: async value => { area.value = value; inputEvents.input(); const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); await new Promise(resolve => setImmediate(resolve)); } };
}

test('failed note autosave retains input, reports an error, and only successful retry marks it saved', async () => {
  const f = await fixture(); f.edit(); await f.input('Opslaan\n[ ] Keep this input');
  assert.equal(f.state().savedAt, 0); assert.equal(f.state().note, 'Opslaan\n[ ] Keep this input');
  assert.match(f.state().error, /save/i); assert.equal(f.area.value, f.state().note);
  f.result({ ok: true }); f.retrySave(); await new Promise(resolve => setImmediate(resolve));
  assert.ok(f.state().savedAt > 0); assert.equal(f.state().error, '');
});

test('note editing has a named native button and checklist names and state', async () => {
  const f = await fixture();
  assert.match(f.root.innerHTML, /<button[^>]*data-edit="1"[^>]*>Edit note<\/button>/);
  assert.match(f.root.innerHTML, /role="checkbox"[^>]*aria-checked="false"[^>]*aria-label="Ship it"/);
  f.edit(); assert.equal(f.focused(), true);
  assert.match(f.root.innerHTML, /textarea[^>]*aria-label="Note"/);
  assert.equal((await fixture('My note\n[x] Ship it')).root.innerHTML.includes('aria-checked="true"'), true);
});

test('a failed note read offers retry without allowing an empty overwrite', async () => {
  const f = await fixture('', false); f.edit();
  assert.equal(f.focused(), false); assert.equal(f.state().note, null);
  assert.match(f.state().error, /load/i);
});



test('quit flushes a pending note and reports a failed write', async () => {
  const f = await fixture(); f.edit(); f.pendingInput('Latest unsaved edit');
  f.result({ ok: false }); assert.equal(await f.flush(), false); assert.match(f.state().error, /save/i);
  f.result({ ok: true }); assert.equal(await f.flush(), true); assert.equal(f.state().note, 'Latest unsaved edit');
  assert.ok(f.state().savedAt > 0); assert.equal(f.state().error, '');
});


test('hidden-layer quit waits for note flush and stays open on failure', async () => {
  const source = fs.readFileSync(require.resolve('../main.js'), 'utf8');
  const start = source.indexOf('// Goodbye'), end = source.indexOf("  'twocode:notify'", start);
  const boundary = source.lastIndexOf('ipcMain.on(', end); assert.ok(start >= 0 && boundary > start);
  let handler, resolveFlush, quits = 0, errors = 0;
  const pending = new Promise(resolve => { resolveFlush = resolve; });
  const app = { orixRestartRequested: true, on: (_name, fn) => { handler = fn; }, prependListener: (_name, fn) => { handler = fn; }, quit: () => { quits++; } };
  const context = { app, settingsApp: { prepareQuit: async () => true }, mascotWindow: { isDestroyed: () => false, isVisible: () => false, webContents: { executeJavaScript: () => pending } },
    dialog: { showMessageBox: async () => { errors++; } }, setTimeout: () => 1, clearTimeout() {} };
  vm.runInNewContext(source.slice(start, boundary), context);
  let prevented = false; handler({ preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true); assert.equal(quits, 0);
  resolveFlush(false); await new Promise(resolve => setImmediate(resolve));
  assert.equal(quits, 0); assert.equal(errors, 1); assert.equal(app.orixRestartRequested, false);
});


test('a note edited while flushing is saved again before quit proceeds', async () => {
  const f = await fixture(); f.edit(); f.pendingInput('First edit');
  let complete; f.result(new Promise(resolve => { complete = resolve; }));
  const flush = f.flush(); f.pendingInput('Latest edit');
  f.result({ ok: true }); complete({ ok: true });
  assert.equal(await flush, true); assert.equal(f.state().note, 'Latest edit');
  assert.ok(f.state().savedAt > 0); assert.equal(f.state().error, '');
});

test('successful note flush allows a hidden-layer quit', async () => {
  const source = fs.readFileSync(require.resolve('../main.js'), 'utf8');
  const start = source.indexOf('// Goodbye'), end = source.indexOf("  'twocode:notify'", start), boundary = source.lastIndexOf('ipcMain.on(', end);
  assert.ok(start >= 0 && boundary > start); let handler, quits = 0;
  const app = { on: (_name, fn) => { handler = fn; }, quit: () => { quits++; } };
  const context = { app, settingsApp: { prepareQuit: async () => true }, mascotWindow: { isDestroyed: () => false, isVisible: () => false, webContents: { executeJavaScript: async () => true } },
    dialog: { showMessageBox: async () => { throw Error('unexpected dialog'); } }, setTimeout: () => 1, clearTimeout() {} };
  vm.runInNewContext(source.slice(start, boundary), context);
  let prevented = false; handler({ preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true); await new Promise(resolve => setImmediate(resolve)); assert.equal(quits, 1);
  prevented = false; handler({ preventDefault: () => { prevented = true; } }); assert.equal(prevented, false);
});


test('visible-layer quit flushes again after the goodbye animation', async () => {
  const source = fs.readFileSync(require.resolve('../main.js'), 'utf8');
  const start = source.indexOf('// Goodbye'), end = source.indexOf("  'twocode:notify'", start), boundary = source.lastIndexOf('ipcMain.on(', end);
  assert.ok(start >= 0 && boundary > start); let handler, flushes = 0, goodbye = 0, goodbyeTimer;
  const app = { on: (_name, fn) => { handler = fn; }, quit() { handler(event()); } };
  function event() { return { preventDefault() {} }; }
  const context = { app, settingsApp: { prepareQuit: async () => true }, mascotWindow: { isDestroyed: () => false, isVisible: () => true,
    webContents: { executeJavaScript: async () => { flushes++; return true; }, send: () => { goodbye++; } } },
    dialog: { showMessageBox: async () => {} }, setTimeout: (fn, ms) => { if (ms === 1000) goodbyeTimer = fn; return 1; }, clearTimeout() {} };
  vm.runInNewContext(source.slice(start, boundary), context); handler(event());
  await new Promise(resolve => setImmediate(resolve)); assert.equal(flushes, 2); assert.equal(goodbye, 1);
  goodbyeTimer(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(flushes, 4); assert.equal(goodbye, 1);
});


test('restart is scheduled only when shutdown reaches will-quit', () => {
  const source = fs.readFileSync(require.resolve('../tray-main.cjs'), 'utf8');
  const start = source.indexOf('function quit()'), end = source.indexOf('function buildMenu()', start);
  assert.ok(start >= 0 && end > start); let shutdown, quits = 0, relaunches = 0;
  const app = { on: (event, fn) => { assert.equal(event, 'will-quit'); shutdown = fn; }, quit: () => { quits++; }, relaunch: () => { relaunches++; } };
  const context = { app }; vm.runInNewContext(source.slice(start, end), context); context.restart();
  assert.equal(quits, 1); assert.equal(relaunches, 0); assert.equal(app.orixRestartRequested, true);
  shutdown(); assert.equal(relaunches, 1);
});


test('a stalled note flush blocks duplicate quits, reports failure, and permits a later retry', async () => {
  const source = fs.readFileSync(require.resolve('../main.js'), 'utf8');
  const start = source.indexOf('// Goodbye'), end = source.indexOf("  'twocode:notify'", start), boundary = source.lastIndexOf('ipcMain.on(', end);
  assert.ok(start >= 0 && boundary > start);
  let handler, timeout, attempts = 0, quits = 0, errors = 0, shouldStall = true;
  const app = { orixRestartRequested: true, on: (_event, fn) => { handler = fn; }, quit: () => { quits++; } };
  const context = { app, settingsApp: { prepareQuit: async () => true }, mascotWindow: { isDestroyed: () => false, isVisible: () => false,
    webContents: { executeJavaScript: () => { attempts++; return shouldStall ? new Promise(() => {}) : Promise.resolve(true); } } },
    dialog: { showMessageBox: async () => { errors++; } }, setTimeout: (fn, ms) => { assert.equal(ms, 10000); timeout = fn; return 1; }, clearTimeout() {} };
  vm.runInNewContext(source.slice(start, boundary), context);
  let prevented = 0; const event = () => ({ preventDefault: () => { prevented++; } });
  handler(event()); handler(event()); await new Promise(resolve => setImmediate(resolve));
  assert.equal(prevented, 2); assert.equal(attempts, 1); assert.equal(quits, 0);
  timeout(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(errors, 1); assert.equal(app.orixRestartRequested, false); assert.equal(quits, 0);
  shouldStall = false; handler(event()); await new Promise(resolve => setImmediate(resolve));
  assert.equal(attempts, 3); assert.equal(quits, 1);
});


test('quit leaves all windows open when Settings preflight is cancelled', async () => {
  const source = fs.readFileSync(require.resolve('../main.js'), 'utf8');
  const start = source.indexOf('// Goodbye'), end = source.indexOf("  'twocode:notify'", start), boundary = source.lastIndexOf('ipcMain.on(', end);
  let handler, quits = 0, checked = 0;
  const app = { orixRestartRequested: true, on: (_event, fn) => { handler = fn; }, quit: () => { quits++; } };
  const settingsApp = { prepareQuit: async () => { checked++; return false; } };
  const context = { app, settingsApp, mascotWindow: { isDestroyed: () => false, isVisible: () => false, webContents: { executeJavaScript: async () => true } },
    dialog: { showMessageBox: async () => {} }, setTimeout: () => 1, clearTimeout() {} };
  vm.runInNewContext(source.slice(start, boundary), context); let prevented = false;
  handler({ preventDefault: () => { prevented = true; } }); await new Promise(resolve => setImmediate(resolve));
  assert.equal(prevented, true); assert.equal(checked, 1); assert.equal(quits, 0); assert.equal(app.orixRestartRequested, false);
});
