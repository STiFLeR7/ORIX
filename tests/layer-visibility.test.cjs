'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { EventEmitter } = require('node:events');

function fixture(t, storage = fs) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-layer-test-'));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  const handlers = new Map(), windows = [], app = new EventEmitter(), nativeTheme = new EventEmitter();
  app.getPath = () => folder;
  app.getLocale = () => 'nl-NL';
  Object.assign(nativeTheme, { shouldUseDarkColors: true, shouldUseHighContrastColors: false });
  function window(page) {
    const win = new EventEmitter(); let visible = false;
    win.webContents = { getURL: () => pathToFileURL(path.resolve(__dirname, '..', page)).href,
      mainFrame: {}, send: (...args) => { win.messages.push(args); } };
    win.messages = []; win.isDestroyed = () => false;
    win.isMinimized = () => false; win.focus = () => { win.focused = true; };
    win.isAlwaysOnTop = () => !!win.top;
    win.setAlwaysOnTop = on => { win.top = on && !win.top; }; win.moveTop = () => { win.front = true; };
    win.hide = () => { visible = false; win.emit('hide'); };
    win.showInactive = () => { visible = true; win.emit('show'); };
    win.isVisible = () => visible;
    win.event = () => ({ sender: win.webContents, senderFrame: win.webContents.mainFrame });
    windows.push(win); return win;
  }
  function load() {
    const mod = { exports: {} };
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../orix-layer-main.cjs'), 'utf8'), {
      module: mod, __dirname: path.resolve(__dirname, '..'), console,
      require: name => name === 'electron' ? { app, nativeTheme, BrowserWindow: { getAllWindows: () => windows }, ipcMain: { handle: (key, fn) => handlers.set(key, fn) } } : name === 'node:fs' ? storage : name === './orix-copy.cjs' ? require('../orix-copy.cjs') : require(name)
    });
    return mod.exports;
  }
  return { folder, handlers, windows, window, load, app, nativeTheme };
}

test('system theme snapshots are trusted, native updates are broadcast without changing preferences', t => {
  const f = fixture(t), island = f.window('mascot.html'), foreign = f.window('unrelated.html'); f.load();
  const get = f.handlers.get('orix:system-get');
  assert.equal(get(foreign.event()), null);
  assert.equal(get(island.event()).dark, true);
  assert.equal(get(island.event()).locale, 'nl-NL');
  f.nativeTheme.shouldUseDarkColors = false; f.nativeTheme.shouldUseHighContrastColors = true; f.nativeTheme.emit('updated');
  assert.equal(island.messages.at(-1)[0], 'orix:system-changed');
  assert.equal(island.messages.at(-1)[1].dark, false);
  assert.equal(island.messages.at(-1)[1].highContrast, true);
  assert.equal(fs.existsSync(path.join(f.folder, 'orix-layer.json')), false);
});
test('only the island can publish committed appearance, and late context windows can read it', t => {
  const f = fixture(t), island = f.window('mascot.html'), dashboard = f.window('settings-app.html'), buddy = f.window('buddy.html'); f.load();
  const publish = f.handlers.get('orix:appearance-commit'), get = f.handlers.get('orix:appearance-get');
  const value = { themeMode: 'system', motionMode: 'reduced', lang: 'en' };
  assert.equal(publish(dashboard.event(), value).ok, false);
  assert.equal(publish(island.event(), { ...value, lang: 'xx' }).ok, false);
  assert.equal(publish(island.event(), value).ok, true);
  assert.equal(get(buddy.event()).lang, 'en');
  assert.equal(publish(island.event(), { ...value, lang: 'nl' }).ok, false);
  assert.equal(f.handlers.get('orix:layer-set')(island.event(), 'off').error, 'Choose ON or OFF.');
  assert.equal(dashboard.messages.at(-1)[0], 'orix:appearance-committed');
  assert.equal(fs.existsSync(path.join(f.folder, 'twocode-prefs.json')), false);
});

test('visibility persists independently and hides without destroying registered renderers', t => {
  const f = fixture(t), island = f.window('mascot.html'), settings = f.window('settings-app.html');
  const controller = f.load();
  controller.registerSurface(island); island.showInactive(); settings.showInactive();
  assert.equal(controller.getState().visible, true);
  assert.equal(controller.setVisible(false).ok, true);
  assert.equal(island.isVisible(), false);
  assert.equal(settings.isVisible(), true);
  assert.equal(island.isDestroyed(), false);
  assert.equal(f.load().getState().visible, false);
  assert.equal(settings.messages.at(-1)[0], 'orix:layer-changed');
  controller.setVisible(true);
  assert.equal(island.isVisible(), true);
});
test('explicit tool reveal restores stacking and focus, but cannot override OFF', t => {
  const f = fixture(t), c = f.load(), island = f.window('mascot.html'); c.registerSurface(island);
  assert.equal(c.reveal('focus'), true);
  assert.equal(island.top, true); assert.equal(island.front, true); assert.equal(island.focused, true);
  assert.equal(island.messages.at(-1)[1], 'focus');
  c.setVisible(false); const count = island.messages.length;
  assert.equal(c.reveal('note'), false); assert.equal(island.messages.length, count);
  assert.equal(island.isVisible(), false);
});

test('reopening a topmost layer does not clear its topmost state', t => {
  const f = fixture(t), c = f.load(), island = f.window('mascot.html'); c.registerSurface(island);
  island.top = true; assert.equal(c.reveal('note'), true); assert.equal(island.top, true);
});

test('tool reveal restores topmost when native focus clears it', t => {
  const f = fixture(t), c = f.load(), island = f.window('mascot.html');
  island.top = true;
  island.focus = () => { island.focused = true; island.top = false; };
  assert.equal(c.reveal('spotify'), true);
  assert.equal(island.focused, true);
  assert.equal(island.isAlwaysOnTop(), true);
  assert.equal(island.messages.at(-1)[1], 'spotify');
});

test('tool reveal raises the layer after focusing it', t => {
  const f = fixture(t), c = f.load(), island = f.window('mascot.html'), calls = [];
  island.focus = () => calls.push('focus'); island.moveTop = () => calls.push('raise');
  c.reveal('note'); assert.deepEqual(calls, ['focus', 'raise']);
});

test('OFF suppresses new surfaces and delayed shows without touching tool data', t => {
  const f = fixture(t), c = f.load();
  const note = path.join(f.folder, 'note.json'); fs.writeFileSync(note, '{"text":"keep me"}');
  c.setVisible(false);
  const replacement = f.window('mascot.html'); c.registerSurface(replacement); replacement.showInactive();
  const buddy = f.window('buddy.html'); c.registerSurface(buddy); buddy.showInactive();
  assert.equal(replacement.isVisible(), false); assert.equal(buddy.isVisible(), false);
  assert.equal(fs.readFileSync(note, 'utf8'), '{"text":"keep me"}');
  c.setVisible(true);
  assert.equal(replacement.isVisible(), true);
  assert.equal(buddy.isVisible(), false, 'ON must not resurrect an inactive context overlay');
});

test('visibility IPC rejects foreign windows, subframes and nonboolean writes', t => {
  const f = fixture(t), c = f.load(), island = f.window('mascot.html'); c.registerSurface(island);
  const foreign = f.window('unrelated.html');
  const set = f.handlers.get('orix:layer-set'), get = f.handlers.get('orix:layer-get');
  assert.equal(get(foreign.event()), null);
  assert.equal(set(foreign.event(), false).ok, false);
  assert.equal(set({ sender: island.webContents, senderFrame: {} }, false).ok, false);
  assert.equal(set(island.event(), 'false').ok, false);
  assert.equal(c.isVisible(), true);
  assert.equal(set(island.event(), false).ok, true);
});

test('invalid schema defaults ON and disk failure preserves the old state with a safe error', t => {
  const f = fixture(t, { ...fs, writeFileSync() { throw new Error('sensitive local path'); } });
  fs.writeFileSync(path.join(f.folder, 'orix-layer.json'), '{"version":1,"visible":"false"}');
  const c = f.load(); assert.equal(c.isVisible(), true);
  const result = c.setVisible(false);
  assert.equal(result.ok, false); assert.equal(result.visible, true);
  assert.doesNotMatch(result.error, /sensitive local path/);
  assert.equal(c.isVisible(), true);
});

test('tray explicit Show restores OFF, while a second launch opens Settings and leaves OFF', async t => {
  const f = fixture(t), c = f.load(), island = f.window('mascot.html'); c.registerSurface(island); c.setVisible(false);
  let menu, tray;
  Object.assign(f.app, { orixLanguage: 'en', isPackaged: true, requestSingleInstanceLock: () => true, setName() {},
    whenReady: () => Promise.resolve(), getLoginItemSettings: () => ({ openAtLogin: false }) });
  let openedSettings = 0; f.app.on('twocode-open-settings', () => openedSettings++);
  const electron = { app: f.app, BrowserWindow: { getAllWindows: () => f.windows },
    ipcMain: { handle() {}, on() {} }, nativeImage: { createFromPath() {} },
    Menu: { buildFromTemplate: template => { menu = template; return template; } },
    Tray: class extends EventEmitter { constructor() { super(); tray = this; } setToolTip() {} setContextMenu() {} }
  };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../tray-main.cjs'), 'utf8'), {
    module: { exports: {} }, __dirname: path.resolve(__dirname, '..'), process: { platform: 'linux', execPath: 'ORIX.exe', argv: [] },
    require: name => name === 'electron' ? electron : name === './orix-layer-main.cjs' ? c : name === './orix-copy.cjs' ? require('../orix-copy.cjs') : require(name)
  });
  await Promise.resolve();
  f.app.emit('second-instance', {}, []);
  assert.equal(c.isVisible(), false);
  assert.equal(openedSettings, 1);
  const show = menu.find(item => item.label === 'Show desktop layer'); assert.ok(show);
  show.click(); assert.equal(c.isVisible(), true); assert.equal(island.isVisible(), true);
  c.setVisible(false); tray.emit('click'); assert.equal(c.isVisible(), true);
  c.setVisible(false);
  f.handlers.get('orix:appearance-commit')(island.event(), { lang: 'en', themeMode: 'dark', motionMode: 'system' });
  assert.ok(menu.some(item => item.label === 'Show desktop layer'));
});

test('OFF ends context dragging without clearing pending AI work or hiding the island mark permanently', t => {
  const f = fixture(t), island = f.window('mascot.html'), c = f.load();
  const cleared = [];
  const context = vm.createContext({
    module: { exports: {} }, __dirname: path.resolve(__dirname, '..'), process: { env: {} },
    setTimeout, clearTimeout, setInterval: () => 123, clearInterval: id => cleared.push(id), console,
    require: name => name === 'electron' ? { app: Object.assign(f.app, { whenReady: () => ({ then() {} }) }),
      BrowserWindow: { getAllWindows: () => f.windows }, ipcMain: { on() {}, handle() {} } }
      : name === './orix-layer-main.cjs' ? c : name === './chatgpt-provider' ? {} : require(name)
  });
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../buddy-main.cjs'), 'utf8'), context);
  vm.runInContext("state='carry'; follow=123; chatTarget={title:'keep AI context'}; pendingChat={text:'keep pending work'};", context);
  c.setVisible(false);
  assert.ok(cleared.includes(123));
  assert.equal(vm.runInContext('state', context), 'home');
  assert.equal(vm.runInContext('chatTarget.title', context), 'keep AI context');
  assert.equal(vm.runInContext('pendingChat.text', context), 'keep pending work');
  assert.ok(island.messages.some(([channel]) => channel === 'buddy:home'));
});

test('shared trust check permits only main frames of the island and dashboard', t => {
  const f = fixture(t), island = f.window('mascot.html'), dashboard = f.window('settings-app.html'), buddy = f.window('buddy.html'), foreign = f.window('unrelated.html'), c = f.load();
  assert.equal(c.trusted(island.event()), true); assert.equal(c.trusted(dashboard.event()), true);
  assert.equal(c.trusted(buddy.event()), false); assert.equal(c.trusted(foreign.event()), false);
  assert.equal(c.trusted({ sender: island.webContents, senderFrame: {} }), false);
});

test('island-only controls reject spoofed frame URLs and subframes', t => {
  const f = fixture(t), island = f.window('mascot.html'), foreign = f.window('other.html'), c = f.load();
  island.webContents.mainFrame.url = 'file:///mascot.html';
  for (const file of ['settings-app-main.cjs', 'buddy-main.cjs', 'tray-main.cjs']) {
    const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
    const declaration = source.match(/const fromIsland = [^\n]+/);
    assert.ok(declaration, file);
    const context = { desktopLayer: c, require: name => name === './orix-layer-main.cjs' ? c : require(name) };
    vm.runInNewContext(declaration[0] + '\nglobalThis.check = fromIsland;', context);
    assert.equal(context.check(island.event()), true, file + ' legitimate main frame');
    assert.equal(context.check({ sender: island.webContents, senderFrame: { url: 'file:///mascot.html' } }), false, file + ' subframe');
    foreign.webContents.mainFrame.url = 'file:///mascot.html';
    assert.equal(context.check({ sender: foreign.webContents, senderFrame: foreign.webContents.mainFrame }), false, file + ' foreign window');
  }
});

test('window selection ignores foreign mascot-named URLs for Settings, buddy and recovery', t => {
  const f = fixture(t), foreign = f.window('foreign.html'), island = f.window('mascot.html'), c = f.load();
  foreign.webContents.getURL = () => 'data:text/html,<title>mascot.html</title>';
  assert.equal(c.findIsland(), island);
  for (const file of ['settings-app-main.cjs', 'buddy-main.cjs']) {
    const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
    const declaration = source.match(/const island = [^\n]+/); assert.ok(declaration, file);
    const context = { desktopLayer: c, BrowserWindow: { getAllWindows: () => f.windows }, require: name => name === './orix-layer-main.cjs' ? c : require(name) };
    vm.runInNewContext(declaration[0] + '\nglobalThis.select = island;', context);
    assert.equal(context.select(), island, file);
  }
});

test('dashboard and context controls require their own trusted main frame', t => {
  const f = fixture(t), dashboard = f.window('settings-app.html'), buddy = f.window('buddy.html'), foreign = f.window('other.html'), c = f.load();
  for (const [file, guard, binding, win] of [['settings-app-main.cjs', 'fromApp', 'win', dashboard], ['buddy-main.cjs', 'fromLayer', 'layer', buddy]]) {
    const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
    const declaration = source.match(new RegExp('const ' + guard + ' = [^\\n]+')); assert.ok(declaration, file);
    const context = { [binding]: win, desktopLayer: c, require: name => name === './orix-layer-main.cjs' ? c : require(name) };
    vm.runInNewContext(declaration[0] + '\nglobalThis.check = ' + guard + ';', context);
    assert.ok(context.check(win.event()), file + ' main frame');
    assert.ok(!context.check({ sender: win.webContents, senderFrame: {} }), file + ' subframe');
    assert.ok(!context.check(foreign.event()), file + ' foreign window');
    win.webContents.getURL = () => 'data:text/html,unexpected';
    assert.ok(!context.check(win.event()), file + ' navigated window');
  }
});
