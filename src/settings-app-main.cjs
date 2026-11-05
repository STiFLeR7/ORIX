// ORIX Settings: settings as their own app, with a big live Robo who shows off every choice.
// Opened from the island's gear (settings-bridge-ui.js) or from the tray menu (tray-main.cjs).
// The settings code itself stays in the island: this window asks it for the lists and passes clicks on.
const { app, BrowserWindow, ipcMain, nativeTheme, shell, dialog } = require('electron');
const path = require('node:path');
const { text } = require('./orix-copy.cjs');

let win = null, dirty = false, closing = false;
// Its own app for Windows: own name, own icon, own taskbar button (tray-main.cjs makes the Start menu shortcut).
const APP_ID = 'app.orix.settings', APP_NAME = 'ORIX Settings', ICON = path.join(__dirname, '..', 'assets', 'settings-icon.ico');
// light or dark, chosen in the app (the window's own buttons top right follow it)
const THEMES = { dark: { bg: '#111315', symbol: '#f3f5f7' }, light: { bg: '#f2f4f6', symbol: '#171b20' } };
const island = () => require('./orix-layer-main.cjs').findIsland();
const fromApp = e => win && !win.isDestroyed() && e.sender === win.webContents && require('./orix-layer-main.cjs').trusted(e, ['settings-app.html']);
const fromIsland = e => require('./orix-layer-main.cjs').trusted(e, ['mascot.html']);
const faceWanted = on => island()?.webContents.executeJavaScript(`window.__orixFaceForSettings = ${on ? 'true' : 'false'}`).catch(() => {});

let theme = 'dark', appLang = 'en';
const lang = () => 'en';
const TABS = ['home', 'connect', 'apps', 'news', 'karakter', 'wardrobe', 'general', 'ai', 'about',
  'overview', 'appearance', 'modules', 'settings', 'settings/general', 'settings/connections', 'settings/ai', 'settings/updates', 'settings/about'];
function open(tab) {
  tab = TABS.includes(tab) ? tab : '';
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) win.restore();
    win.show(); win.focus();
    if (tab) win.webContents.send('settings-app:goto', tab);
    return;
  }
  win = new BrowserWindow({
    width: 1120, height: 760, minWidth: 820, minHeight: 560, show: false, title: APP_NAME,
    backgroundColor: THEMES[theme].bg, icon: ICON,
    titleBarStyle: 'hidden', titleBarOverlay: { color: THEMES[theme].bg, symbolColor: THEMES[theme].symbol, height: 44 },
    webPreferences: { preload: path.join(__dirname, 'settings-app-preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.setMenuBarVisibility(false);
  if (process.platform === 'win32') {
    try {
      win.setAppDetails({ appId: APP_ID, appIconPath: ICON, appIconIndex: 0, relaunchDisplayName: APP_NAME,
        relaunchCommand: `"${process.execPath}" ` + (app.isPackaged ? '' : `"${app.getAppPath()}" `) + '--settings' });
    } catch {}
  }
  win.loadFile(path.join(__dirname, 'settings-app.html'), tab ? { query: { tab } } : {});
  win.once('ready-to-show', () => { win.show(); win.focus(); });
  win.on('show', () => faceWanted(true));
  win.on('hide', () => faceWanted(false));
  win.on('minimize', () => faceWanted(false));
  win.on('restore', () => faceWanted(true));
  // closing with changes that are not saved yet: ask first
  win.on('close', e => {
    if (!dirty || closing) return;
    e.preventDefault();
    dialog.showMessageBox(win, { type: 'question', title: 'ORIX', noLink: true, defaultId: 0, cancelId: 2,
      buttons: ['Save', 'Don\'t save', 'Cancel'],
      message: 'You have changes that are not saved yet.',
      detail: 'Save them before closing?' })
      .then(async ({ response }) => {
        if (response === 2 || !win) { app.orixRestartRequested = false; return; }
        const result = await relay({ kind: response === 0 ? 'save' : 'discard' });
        if (!win) return;
        if (!result?.ok) {
          app.orixRestartRequested = false;
          await dialog.showMessageBox(win, { type: 'error', title: 'ORIX', message: result?.error || text(lang(), 'savePreferences') });
          return;
        }
        closing = true; win?.close();
        if (app.orixRestartRequested) app.quit();
      }).catch(() => { app.orixRestartRequested = false; });
  });
  win.on('closed', () => {
    win = null; dirty = false; closing = false; faceWanted(false);
    island()?.webContents.executeJavaScript('window.__orixSettingsClosed?.()').catch(() => {}); // an unsaved draft is gone
  });
  // links in settings (for example "how to get your calendar link") open in the browser
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) require('electron').shell.openExternal(url); return { action: 'deny' }; });
}

// Ask the island: a list, or a click on one of its options (it answers with the fresh list).
async function relay(req) {
  const isl = island();
  if (!isl) return { ok: false, error: text(lang(), 'starting') };
  try { return { ok: true, ...(await isl.webContents.executeJavaScript(`window.__orixRemoteSettings(${JSON.stringify(req)})`)) }; }
  catch (error) { return { ok: false, error: req.kind === 'save' ? text(lang(), 'savePreferences') : String(error?.message || error).slice(0, 200) }; }
}
async function prepareQuit() {
  if (!win || win.isDestroyed() || !dirty || closing) return true;
  const current = win;
  try {
    const { response } = await dialog.showMessageBox(current, { type: 'question', title: 'ORIX', noLink: true, defaultId: 0, cancelId: 2,
      buttons: ['Save', "Don't save", 'Cancel'], message: 'You have changes that are not saved yet.', detail: 'Save them before closing?' });
    if (response === 2 || win !== current || current.isDestroyed()) return false;
    const result = await relay({ kind: response === 0 ? 'save' : 'discard' });
    if (win !== current || current.isDestroyed()) return false;
    if (!result?.ok) {
      await dialog.showMessageBox(current, { type: 'error', title: 'ORIX', message: result?.error || text(lang(), 'savePreferences') });
      return false;
    }
    dirty = false;
    return true;
  } catch { return false; }
}

const clean = req => {
  if (req?.kind === 'appearance' || req?.kind === 'appearance-init') {
    const values = req.values;
    if (!values || typeof values !== 'object' || Array.isArray(values)) return null;
    const allowed = req.kind === 'appearance-init' ? { legacyTheme: ['light', 'dark', null] }
      : { themeMode: ['light', 'dark', 'system'], motionMode: ['full', 'reduced', 'system'], lang: ['en'] };
    if (Object.entries(values).some(([key, value]) => !allowed[key]?.includes(value))) return null;
    return { kind: req.kind, values: Object.fromEntries(Object.entries(values)) };
  }
  return ({
  kind: ['click', 'apps', 'app', 'save', 'discard'].includes(req?.kind) ? req.kind : 'list',
  id: typeof req?.id === 'string' ? req.id.slice(0, 20) : undefined,
  on: req?.on === true,
  which: req?.which === 'karakter' ? 'karakter' : 'general',
  index: Number.isInteger(req?.index) ? req.index : undefined,
  row: Number.isInteger(req?.row) ? req.row : undefined,
  values: Object.fromEntries(Object.entries(req?.values || {}).filter(([k, v]) => /^tc-in-[\w-]+$/.test(k) && typeof v === 'string').map(([k, v]) => [k, v.slice(0, 2000)]))
  });
};

ipcMain.on('settings-app:open', (e, tab) => { if (fromIsland(e)) open(tab); });
ipcMain.handle('settings-app:tool', (e, view) => {
  if (!fromApp(e) || e.senderFrame !== e.sender.mainFrame || !['note', 'focus', 'clips', 'tray', 'spotify', 'ai-settings'].includes(view)) return { ok: false };
  if (!require('./orix-layer-main.cjs').isVisible()) return { ok: false, error: text(lang(), 'showFirst') };
  return require('./orix-layer-main.cjs').reveal(view) ? { ok: true } : { ok: false, error: text(lang(), 'starting') };
});
ipcMain.handle('settings-app:get', async (e, req) => {
  if (!fromApp(e)) return null;
  const cleaned = clean(req);
  if (!cleaned) return { ok: false, error: text(lang(), 'invalidAppearance') };
  const r = await relay(cleaned);
  if (r?.info) { dirty = !!r.info.dirty; appLang = 'en'; }
  return r;
});
ipcMain.on('settings-app:dirty', (e, on) => { if (fromApp(e)) dirty = !!on; }); // the AI choice is a draft in the app itself
ipcMain.on('settings-app:theme', (e, value) => {
  const name = typeof value === 'string' ? value : value?.theme;
  if (!fromApp(e) || !THEMES[name]) return;
  appLang = 'en';
  theme = name;
  try { win.setTitleBarOverlay({ color: THEMES[name].bg, symbolColor: THEMES[name].symbol, height: 44 }); win.setBackgroundColor(THEMES[name].bg); } catch {}
});
ipcMain.on('settings-app:frame', (e, url) => { // the app's own Robo, drawn by the island from your draft (buddy-ui.js)
  if (fromIsland(e) && win && !win.isDestroyed() && typeof url === 'string' && url.startsWith('data:image/')) win.webContents.send('settings-app:face', url);
});
app.on('orix-open-settings', () => open()); // tray menu, or the Start menu shortcut while ORIX runs
if (process.argv.includes('--settings')) app.whenReady().then(() => setTimeout(() => open(), 1200)); // started from the Start menu shortcut

// Home and Verbindingen: your name, what your AI did, and which AIs ORIX follows (ai-monitor-main.cjs).
const os = require('node:os'), fs = require('node:fs');
const userName = () => { const n = String(os.userInfo().username || '').replace(/[._-]+/g, ' ').trim(); return n ? n[0].toUpperCase() + n.slice(1) : ''; };
async function connections() {
  const m = app.orixMonitor; if (!m) return { ok: false };
  const view = m.view(), auto = (await m.handlers['ai-monitor:auto-get']()).auto;
  const by = id => view.providers.find(p => p.provider === id) || {};
  const item = (id, on, available, p) => ({ id, on: !!on, available, soon: !!p.soon, state: p.connected ? (p.permission ? 'question' : p.state) : 'off', detail: p.detail || '', project: p.source?.title || '' });
  return { ok: true, list: [
    item('claudecode', by('claudecode').hooksInstalled, fs.existsSync(path.join(os.homedir(), '.claude')), by('claudecode')),
    item('codex', by('codex').hooksInstalled, by('codex').available !== false, by('codex')),
    item('claude', auto.claude, true, by('claude')),
    item('chatgpt', auto.chatgpt, true, by('chatgpt'))
  ] };
}
async function connect(id, on) {
  const h = app.orixMonitor?.handlers; if (!h) throw new Error(text(lang(), 'starting'));
  if (id === 'claudecode' || id === 'codex') await h[on ? 'ai-monitor:hooks-install' : 'ai-monitor:hooks-uninstall']({ agent: id === 'codex' ? 'codex' : 'claude' });
  else if (id === 'claude' || id === 'chatgpt') { const r = await h['ai-monitor:auto-set']({ provider: id, on }); if (on && !r.found) return { ...(await connections()), waiting: id }; }
  return connections();
}
ipcMain.handle('settings-app:home', e => fromApp(e) ? { ok: true, user: userName(), history: app.orixMonitor?.history() || [] } : null);
ipcMain.handle('settings-app:connections', e => fromApp(e) ? connections() : null);
ipcMain.handle('settings-app:connect', async (e, req) => {
  if (!fromApp(e) || !['claudecode', 'codex', 'claude', 'chatgpt'].includes(req?.id)) return null;
  try { return await connect(req.id, req.on === true); } catch (error) { return { ok: false, error: String(error?.message || error) }; }
});

// Releases are local/manual until an ORIX distribution location is chosen.
ipcMain.handle('settings-app:news', e => fromApp(e) ? { ok: true, version: app.getVersion(), releases: [], manual: true } : null);
ipcMain.handle('settings-app:about', e => {
  if (!fromApp(e)) return null;
  try { return { ok: true, version: app.getVersion(), license: fs.readFileSync(path.join(__dirname, '..', 'LICENSE'), 'utf8'), notices: fs.readFileSync(path.join(__dirname, '..', 'THIRD_PARTY_NOTICES.md'), 'utf8') }; }
  catch { return { ok: false, error: text(lang(), 'loadLicense') }; }
});
ipcMain.on('settings-app:open-url', (e, url) => {
  if (fromApp(e) && ['https://github.com/STiFLeR7/ORIX', 'https://github.com/STiFLeR7/ORIX/releases'].includes(url)) shell.openExternal(url);
});

module.exports = { open, prepareQuit };

// tests: SETTINGS_DEBUG=<folder> opens the app on Home and Verbindingen and saves pictures (never touches Claude Code or Codex files)
if (process.env.SETTINGS_DEBUG) app.whenReady().then(() => setTimeout(async () => {
  const fs = require('node:fs'), wait = ms => new Promise(r => setTimeout(r, ms));
  const shot = async name => { const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(process.env.SETTINGS_DEBUG, name + '.png'), img.toPNG()); console.log('SETTINGS shot', name); };
  const js = code => win.webContents.executeJavaScript(code);
  open(); await wait(4000); await js(`setTheme('dark'); 1`); await wait(300); await shot('h1-home');
  await js(`document.querySelector('nav button[data-tab="connect"]').click(); 1`); await wait(1500); await shot('h2-connect');
  await js(`document.querySelector('[data-cx="chatgpt"]')?.click(); 1`); await wait(3000); await shot('h3-chatgpt-on');
  console.log('SETTINGS cx', await js(`JSON.stringify(cxs.list.map(c => c.id + ':' + c.on + ':' + c.state))`));
  await js(`document.querySelector('[data-cx="chatgpt"]')?.click(); 1`); await wait(1000);
  await js(`document.querySelector('nav button[data-tab="ai"]').click(); 1`); await wait(2500); await shot('h4-ai');
  console.log('SETTINGS done'); app.exit(0);
}, 6000));

// tests: SETTINGS_TOUR=<folder> saves a picture of every page, dark and light (only looks, never clicks options)
if (process.env.SETTINGS_TOUR) app.whenReady().then(() => setTimeout(async () => {
  const fs = require('node:fs'), wait = ms => new Promise(r => setTimeout(r, ms)), out = process.env.SETTINGS_TOUR;
  const js = code => win.webContents.executeJavaScript(code);
  open(); await wait(4000);
  for (const mode of (process.env.SETTINGS_TOUR_THEMES || 'dark,light').split(',')) {
    await js(`setTheme(${JSON.stringify(mode)}); 1`);
    for (const t of TABS) {
      await js(`document.querySelector('nav [data-tab="${t}"]')?.click(); 1`); await wait(t === 'news' ? 3500 : 1600);
      const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(out, `${mode}-${t}.png`), img.toPNG());
    }
  }
  console.log('TOUR done'); app.exit(0);
}, 6000));

// video: VIDEO_REC=<folder> opens the app and plays a short tour while saving every frame (for the ORIX reel).
// Only the test profile is used for this; Claude Code and Codex are never switched (that would change their files).
if (process.env.VIDEO_REC) app.whenReady().then(() => setTimeout(async () => {
  const fs = require('node:fs'), out = process.env.VIDEO_REC, wait = ms => new Promise(r => setTimeout(r, ms));
  fs.mkdirSync(path.join(out, 'app'), { recursive: true });
  const js = code => win.webContents.executeJavaScript(code);
  open(); await wait(4500);
  await js(`setTheme('dark'); 1`); await wait(500);
  const marks = [], frames = [], t0 = Date.now(); let n = 0, rec = true;
  const mark = name => { marks.push({ name, t: (Date.now() - t0) / 1000 }); console.log('VIDEO', name); };
  (async () => { while (rec) { const img = await win.webContents.capturePage(); const file = String(n++).padStart(5, '0') + '.jpg'; fs.writeFileSync(path.join(out, 'app', file), img.toJPEG(92)); frames.push((Date.now() - t0) / 1000); } })();
  const click = sel => js(`document.querySelector(${JSON.stringify(sel)})?.click(); 1`);
  mark('home'); await wait(4200);
  mark('connect'); await click('nav button[data-tab="connect"]'); await wait(1600);
  await click('[data-cx="chatgpt"]'); await wait(1300); await click('[data-cx="claude"]'); await wait(2200);
  mark('wardrobe'); await click('nav button[data-tab="wardrobe"]'); await wait(1400);
  await click('.paint[data-value="roos"]'); await wait(1100); await click('.outfit[data-value="hat"]'); await wait(1100);
  await click('.outfit[data-value="shades"]'); await wait(1100); await click('.outfit[data-value="crown"]'); await wait(1100);
  await click('.paint[data-value="lucht"]'); await wait(1300);
  mark('theme'); await click('nav button[data-tab="home"]'); await wait(1200); await js(`setTheme('light'); 1`); await wait(2000); await js(`setTheme('dark'); 1`); await wait(1500);
  mark('end'); rec = false; await wait(400);
  fs.writeFileSync(path.join(out, 'app.json'), JSON.stringify({ marks, frames }));
  await js(`cancelAll && cancelAll(); 1`).catch(() => {}); await click('[data-cx="chatgpt"]'); await click('[data-cx="claude"]'); await wait(800);
  app.exit(0);
}, 6000));
