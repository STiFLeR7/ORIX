'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

function load(file, electron, imports = {}) {
  const filename = path.resolve(__dirname, '../src', file), mod = { exports: {} };
  const realRequire = createRequire(filename);
  vm.runInNewContext('(function () {\n' + fs.readFileSync(filename, 'utf8') + '\n})()', {
    module: mod, exports: mod.exports, __dirname: path.dirname(filename),
    require: name => name === 'electron' ? electron : Object.hasOwn(imports, name) ? imports[name] : realRequire(name),
    process: { env: {}, argv: [], platform: 'win32' },
    console, URL, Buffer, setTimeout, clearTimeout, setInterval, clearInterval,
    fetch: () => { throw new Error('A release-policy check must not use the network'); }
  }, { filename });
  return mod.exports;
}

test('self-install preserves a stranded backup when the target is missing', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/self-install.cjs'), 'utf8');
  const home = 'C:\\fixture\\installed', here = 'C:\\fixture\\source';
  let homeExists = false; const removed = [];
  const fakeFs = { existsSync: p => p === path.join(here, 'resources', 'app', 'package.json') || p === home + '.old' || (p === home && homeExists),
    readFileSync() { throw new Error('missing'); }, mkdirSync() {}, appendFileSync() {}, cpSync() {},
    rmSync: p => removed.push(p), renameSync: (_from, to) => { if (to === home) homeExists = true; } };
  const app = { isPackaged: true, getVersion: () => '1.0.0', getPath: () => 'C:\\fixture\\profile',
    getLoginItemSettings: () => ({ openAtLogin: false }), exit() {} };
  const mod = { exports: {} };
  vm.runInNewContext('(function () {\n' + source + '\n})()', { module: mod, exports: mod.exports,
    require: name => name === 'electron' ? { app } : name === 'fs' ? fakeFs : name === './auto-update-core.cjs' ? { compareVersions: () => 1 } : require(name),
    process: { platform: 'win32', execPath: path.join(here, 'ORIX.exe'), argv: [], env: { ORIX_INSTALL_DIR: home, ORIX_INSTALL_DRYRUN: '1' } },
    SharedArrayBuffer, Atomics, Int32Array, Date });
  assert.equal(mod.exports.handedOver, false);
  assert.equal(homeExists, false);
  assert.equal(removed.includes(home + '.old'), false);
});

test('packaged ORIX cannot schedule, stage, or install a legacy update', async () => {
  const handlers = new Map(), events = new Map();
  let lifecycleRegistrations = 0;
  const app = {
    isPackaged: true, getVersion: () => '0.1.0-beta.1',
    getAppPath: () => path.join(__dirname, 'unused', 'resources', 'app'),
    whenReady: () => { lifecycleRegistrations++; return { then() {} }; },
    on: () => { lifecycleRegistrations++; }
  };
  const updater = load('auto-update.cjs', {
    app, ipcMain: { handle: (key, fn) => handlers.set(key, fn), on: (key, fn) => events.set(key, fn) }
  });
  assert.equal(updater.state().enabled, false);
  assert.equal(updater.state().ready, null);
  await updater.check();
  events.get('update:install')?.({ senderFrame: { url: 'file:///test/mascot.html' } });
  assert.equal(lifecycleRegistrations, 0, 'no startup/idle/quit update lifecycle is registered');
  assert.equal(handlers.get('update:state')({ senderFrame: { url: 'https://example.invalid' } }), null);
});

test('Spotify without an ORIX client ID fails before an OAuth server or browser is opened', async () => {
  const handlers = new Map();
  const imports = Object.fromEntries([
    './tray-main.cjs', './island-window-main', './project-mode-main', './ai-monitor-main.cjs',
    './extras-main.cjs', './settings-app-main.cjs', './license-main.cjs', './auto-update.cjs'
  ].map(name => [name, {}]));
  imports['./self-install.cjs'] = { handedOver: false };
  imports['./orix-layer-main.cjs'] = { trusted: event => event?.trusted === true };
  imports.http = { createServer() { throw new Error('OAuth server started before configuration was checked'); } };
  load('main.js', {
    app: { setName() {}, setAppUserModelId() {}, on() {}, whenReady: () => ({ then() {} }), getPath: () => path.join(__dirname, 'unused') },
    ipcMain: { handle: (key, fn) => handlers.set(key, fn), on() {} },
    shell: { openExternal() { throw new Error('Browser opened before configuration was checked'); } }
  }, imports);
  await assert.rejects(handlers.get('spotify:connect')({ trusted: true }), /ORIX_SPOTIFY_CLIENT_ID/);
});

test('legacy account requests stay disconnected without reading or sending old credentials', async () => {
  let service;
  assert.doesNotThrow(() => { service = require('../src/companion-service.cjs'); });
  const connection = service.getConnection();
  assert.equal(connection.connected, false);
  assert.equal(connection.user, null);
  assert.equal(Object.hasOwn(connection, 'token'), false);
  for (const result of [await service.connectToORIX(), await service.getORIXState()]) {
    assert.equal(result.ok, false);
    assert.equal(result.connected, false);
    assert.match(result.error, /ORIX/);
  }
});

test('Settings news is local, manual, and unavailable to a foreign window', async () => {
  const handlers = new Map(), windows = [];
  let requests = 0;
  class Window {
    constructor() {
      this.webContents = { mainFrame: {}, setWindowOpenHandler() {}, send() {} };
      windows.push(this);
    }
    static getAllWindows() { return []; }
    setMenuBarVisibility() {} setAppDetails() {} loadFile() {} once() {} on() {}
    isDestroyed() { return false; }
  }
  const settings = load('settings-app-main.cjs', {
    app: { on() {}, getVersion: () => '0.1.0-beta.1' },
    BrowserWindow: Window, ipcMain: { handle: (key, fn) => handlers.set(key, fn), on() {} },
    net: { fetch: () => { requests++; throw new Error('Legacy news contacted'); } }
  }, { './orix-layer-main.cjs': { findIsland: () => null, trusted: e => e.senderFrame === e.sender?.mainFrame } });
  settings.open();
  const news = await handlers.get('settings-app:news')({ sender: windows[0].webContents, senderFrame: windows[0].webContents.mainFrame });
  assert.equal(news.ok, true);
  assert.equal(news.manual, true);
  assert.equal(news.releases.length, 0);
  assert.equal(requests, 0);
  assert.equal(await handlers.get('settings-app:news')({ sender: {} }), null);
  const about = await handlers.get('settings-app:about')({ sender: windows[0].webContents, senderFrame: windows[0].webContents.mainFrame });
  assert.equal(about.ok, true); assert.match(about.license, /ISC License/);
  assert.match(about.notices, /Inter/); assert.match(about.notices, /Electron/);
  assert.equal(await handlers.get('settings-app:about')({ sender: {} }), null);
});
