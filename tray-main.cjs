// ORIX in the Windows tray (next to the clock): Robo's face, with a menu to open the island,
// start with Windows, restart and quit. The island itself has no taskbar button, so this is the
// place where you can always find and close ORIX. Also: only one ORIX runs at a time.
const { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const desktopLayer = require('./orix-layer-main.cjs');
const { text } = require('./orix-copy.cjs');

let tray = null;

function openIsland() {
  if (!desktopLayer.setVisible(true).ok) return;
  desktopLayer.reveal('home');
}

// Start with Windows. During development ORIX runs as "electron.exe <folder>", so pass those along.
function loginOptions() { return app.isPackaged ? {} : { path: process.execPath, args: [app.getAppPath()] }; }
function startsWithWindows() { try { return app.getLoginItemSettings(loginOptions()).openAtLogin; } catch { return false; } }
function setStartsWithWindows(on) { try { app.setLoginItemSettings({ ...loginOptions(), openAtLogin: !!on }); } catch {} buildMenu(); }

function quit() { app.quit(); } // main.js shows the goodbye first
function restart() { app.orixRestartRequested = true; app.quit(); }
app.on('will-quit', () => { if (app.orixRestartRequested) app.relaunch(); });

function buildMenu() {
  if (!tray) return;
  const lang = app.orixLanguage || ((app.getLocale?.() || 'en').toLowerCase().startsWith('nl') ? 'nl' : 'en');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'ORIX', enabled: false },
    { type: 'separator' },
    { label: text(lang, desktopLayer.isVisible() ? 'hideLayer' : 'showLayer'), click: () => {
      if (desktopLayer.isVisible()) desktopLayer.setVisible(false); else openIsland();
    } },
    { label: text(lang, 'settings'), click: () => app.emit('twocode-open-settings') },
    { label: text(lang, 'startup'), type: 'checkbox', checked: startsWithWindows(), click: item => setStartsWithWindows(item.checked) },
    { type: 'separator' },
    { label: text(lang, 'restart'), click: restart },
    { label: text(lang, 'quit'), click: quit }
  ]));
}

if (!app.requestSingleInstanceLock()) {
  // ORIX already runs: that one opens its island, this one stops right away.
  app.exit(0);
} else {
  // "ORIX Settings" in the Start menu starts ORIX with --settings: then only that app opens.
  app.on('second-instance', (event, argv) => { if ((argv || []).includes('--settings') || !desktopLayer.isVisible()) app.emit('twocode-open-settings'); else openIsland(); });
  app.on('orix:layer-changed', buildMenu);
  app.on('orix:appearance-committed', buildMenu);
  app.setName('ORIX');
  app.whenReady().then(() => {
    // Windows shows the name and icon of a notification from a Start menu shortcut with the same app id.
    // Without it, notifications said "Electron". Made (or fixed) on every start, it costs nothing.
    if (process.platform === 'win32') {
      try {
        const { shell } = require('electron');
        const programs = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs');
        const link = path.join(programs, 'ORIX.lnk');
        // An old "Electron" shortcut with ORIX's app id made every notification say "Electron". Only that one goes.
        const old = path.join(programs, 'Electron.lnk');
        try {
          const info = require('node:fs').existsSync(old) && shell.readShortcutLink(old);
          if (info && info.appUserModelId === 'app.orix.desktop' && path.resolve(info.target) === path.resolve(process.execPath)) require('node:fs').unlinkSync(old);
        } catch {}
        shell.writeShortcutLink(link, require('node:fs').existsSync(link) ? 'replace' : 'create', {
          target: process.execPath,
          args: app.isPackaged ? '' : `"${app.getAppPath()}"`,
          cwd: app.isPackaged ? path.dirname(process.execPath) : app.getAppPath(),
          icon: path.join(__dirname, 'assets', 'icon.ico'), iconIndex: 0,
          appUserModelId: 'app.orix.desktop',
          description: 'ORIX: your operating system, within reach.'
        });
        // The second app: ORIX Settings, with its own icon and app id (its own button on the taskbar).
        const settingsLink = path.join(programs, 'ORIX Settings.lnk');
        shell.writeShortcutLink(settingsLink, require('node:fs').existsSync(settingsLink) ? 'replace' : 'create', {
          target: process.execPath,
          args: (app.isPackaged ? '' : `"${app.getAppPath()}" `) + '--settings',
          cwd: app.isPackaged ? path.dirname(process.execPath) : app.getAppPath(),
          icon: path.join(__dirname, 'assets', 'settings-icon.ico'), iconIndex: 0,
          appUserModelId: 'app.orix.settings',
          description: 'ORIX Settings: desktop tools and AI connections'
        });
      } catch {}
      // The shortcut alone was not enough: Windows also reads the name and icon of notifications from
      // HKCU\Software\Classes\AppUserModelId\<app id>. Only ORIX's own key, in the user's own registry part.
      try {
        const { execFile } = require('node:child_process');
        const key = 'HKCU\\Software\\Classes\\AppUserModelId\\app.orix.desktop';
        const set = (name, value) => execFile('reg.exe', ['add', key, '/v', name, '/t', 'REG_SZ', '/d', value, '/f'], { windowsHide: true }, () => {});
        set('DisplayName', 'ORIX');
        set('IconUri', path.join(__dirname, 'assets', 'icon-256.png'));
        const key2 = 'HKCU\\Software\\Classes\\AppUserModelId\\app.orix.settings';
        execFile('reg.exe', ['add', key2, '/v', 'DisplayName', '/t', 'REG_SZ', '/d', 'ORIX Settings', '/f'], { windowsHide: true }, () => {});
        execFile('reg.exe', ['add', key2, '/v', 'IconUri', '/t', 'REG_SZ', '/d', path.join(__dirname, 'assets', 'settings-icon.png'), '/f'], { windowsHide: true }, () => {});
      } catch {}
    }
    const image = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png'));
    tray = new Tray(image);
    tray.setToolTip('ORIX');
    tray.on('click', openIsland);
    buildMenu();
  });
  // the icon stays during the goodbye and goes when the app really stops
  app.on('will-quit', () => { try { tray?.destroy(); } catch {} tray = null; });

  // only the island itself may change these
  const fromIsland = e => desktopLayer.trusted(e, ['mascot.html']);
  ipcMain.handle('app:login-get', e => fromIsland(e) ? { ok: true, on: startsWithWindows() } : { ok: false });
  ipcMain.handle('app:login-set', (e, on) => { if (!fromIsland(e)) return { ok: false }; setStartsWithWindows(on); return { ok: true, on: startsWithWindows() }; });
  ipcMain.on('app:restart', e => { if (fromIsland(e)) restart(); });
}

module.exports = { openIsland };
