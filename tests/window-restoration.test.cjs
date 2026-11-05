const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');

async function recover(visible) {
  const app = new EventEmitter();
  app.whenReady = () => Promise.resolve();
  let callback;
  const shown = [];
  const window = page => ({
    isDestroyed: () => false, isMinimized: () => false, isVisible: () => true,
    isFocused: () => false, isAlwaysOnTop: () => true, getBounds: () => ({}),
    showInactive: () => shown.push(page), setAlwaysOnTop() {}, moveTop() {},
    webContents: { id: page, isDestroyed: () => false, getURL: () => 'file:///app/' + page,
      executeJavaScript: async () => ({}) }
  });
  vm.runInNewContext(fs.readFileSync(require.resolve('../island-window-main.js'), 'utf8'), {
    require: name => {
      if (name === './orix-layer-main.cjs') return { isVisible: () => visible, findIsland: () => window('mascot.html') };
      assert.equal(name, 'electron');
      return { app, BrowserWindow: { getAllWindows: () => [window('buddy.html'), window('settings-app.html'), window('mascot.html')] },
        globalShortcut: { register: (_key, fn) => { callback = fn; return true; }, unregister() {} }, ipcMain: { on() {} } };
    }, console: { log() {} }, setTimeout, clearTimeout
  });
  await Promise.resolve();
  await callback();
  return shown;
}
test('restoration selects the island instead of an earlier context or dashboard window', async () => {
  const shown = await recover(true);
  assert.deepEqual(shown, ['mascot.html']);
});
test('restoration cannot override an explicitly hidden layer', async () => {
  assert.deepEqual(await recover(false), []);
});
