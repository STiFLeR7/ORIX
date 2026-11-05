'use strict';
const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const { text } = require('./orix-copy.cjs');

const file = path.join(app.getPath('userData'), 'orix-layer.json');
let visible = true;
try {
  const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (saved.version === 1 && typeof saved.visible === 'boolean') visible = saved.visible;
} catch {}
const surfaces = new Set();
const getState = () => ({ visible });
const isVisible = () => visible;
const systemState = () => ({ dark: nativeTheme?.shouldUseDarkColors === true,
  highContrast: nativeTheme?.shouldUseHighContrastColors === true, locale: app.getLocale?.() || 'en' });
function page(win) {
  try { return path.resolve(fileURLToPath(win.webContents.getURL())); } catch { return ''; }
}
const isPage = (win, name) => page(win).toLowerCase() === path.join(__dirname, name).toLowerCase();
function trusted(event, pages = ['mascot.html', 'settings-app.html']) {
  return event.senderFrame === event.sender?.mainFrame && BrowserWindow.getAllWindows().some(win =>
    !win.isDestroyed() && win.webContents === event.sender && pages.some(name => isPage(win, name)));
}
let committedAppearance = null;
ipcMain.handle('orix:appearance-get', event => trusted(event, ['mascot.html', 'settings-app.html', 'buddy.html']) ? committedAppearance : null);
ipcMain.handle('orix:appearance-commit', (event, value) => {
  if (!trusted(event, ['mascot.html']) || !['light', 'dark', 'system'].includes(value?.themeMode)
    || !['full', 'reduced', 'system'].includes(value?.motionMode) || !['en'].includes(value?.lang)) return { ok: false };
  committedAppearance = { themeMode: value.themeMode, motionMode: value.motionMode, lang: value.lang };
  app.orixLanguage = value.lang;
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed() && ['mascot.html', 'settings-app.html', 'buddy.html'].some(name => isPage(win, name))) win.webContents.send('orix:appearance-committed', committedAppearance);
  }
  app.emit('orix:appearance-committed', committedAppearance);
  return { ok: true };
});
function registerSurface(win) {
  if (surfaces.has(win)) return;
  surfaces.add(win);
  win.on('closed', () => surfaces.delete(win));
  win.on('show', () => { if (!visible && !win.isDestroyed()) win.hide(); });
  if (!visible) win.hide();
}
const findIsland = () => BrowserWindow.getAllWindows().find(win => !win.isDestroyed() && isPage(win, 'mascot.html'));
function reveal(view) {
  if (!visible) return false;
  const win = findIsland();
  if (!win) return false;
  if (win.isMinimized()) win.restore();
  win.showInactive(); win.focus();
  // Native focus can clear topmost on Windows; restore it after activation.
  if (!win.isAlwaysOnTop()) win.setAlwaysOnTop(true, 'floating');
  win.moveTop();
  if (typeof view === 'string') win.webContents.send('extras:shortcut', view);
  return true;
}
function setVisible(next) {
  if (typeof next !== 'boolean') return { ok: false, visible, error: text(app.orixLanguage, 'chooseVisibility') };
  const temp = file + '.tmp';
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(temp, JSON.stringify({ version: 1, visible: next }));
    fs.renameSync(temp, file);
  } catch {
    try { fs.unlinkSync(temp); } catch {}
    return { ok: false, visible, error: text(app.orixLanguage, 'saveVisibility') };
  }
  visible = next;
  for (const win of surfaces) {
    if (win.isDestroyed()) continue;
    if (!visible) win.hide();
    else if (isPage(win, 'mascot.html')) { win.showInactive(); if (!win.isAlwaysOnTop()) win.setAlwaysOnTop(true, 'floating'); }
  }
  const state = getState();
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed() && (isPage(win, 'mascot.html') || isPage(win, 'settings-app.html'))) win.webContents.send('orix:layer-changed', state);
  }
  app.emit('orix:layer-changed', state);
  return { ok: true, ...state };
}
ipcMain.handle('orix:layer-get', event => trusted(event) ? getState() : null);
ipcMain.handle('orix:layer-set', (event, value) => trusted(event) ? setVisible(value) : { ok: false, error: text(app.orixLanguage, 'notAllowed') });
ipcMain.handle('orix:system-get', event => trusted(event, ['mascot.html', 'settings-app.html', 'buddy.html']) ? systemState() : null);
if (nativeTheme) {
  nativeTheme.themeSource = 'system';
  nativeTheme.on('updated', () => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed() && ['mascot.html', 'settings-app.html', 'buddy.html'].some(name => isPage(win, name))) win.webContents.send('orix:system-changed', systemState());
    }
  });
}
module.exports = { getState, setVisible, registerSurface, isVisible, reveal, trusted, findIsland };
