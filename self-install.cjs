// ORIX lives in one fixed place: %LOCALAPPDATA%\Programs\ORIX (like Discord, VS Code user installs).
// Started from anywhere else (the Downloads folder, the zip's temporary folder, Program Files, a USB stick), it copies
// itself there (only when this copy is newer than what is there), starts that copy and stops. So updates always work
// (that folder is always writable and never cleaned up), and the Start menu, "Start with Windows" and the updater all
// point to the same ORIX. Runs first, before anything else starts (main.js). Nothing happens with npm start.
const { app } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { compareVersions } = require('./auto-update-core.cjs');

const retry = act => { for (let i = 0; i < 40; i++) { try { act(); return true; } catch (e) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); } } return false; };
const same = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
const versionIn = dir => { try { return JSON.parse(fs.readFileSync(path.join(dir, 'resources', 'app', 'package.json'), 'utf8')).version; } catch (e) { return null; } };

function installHome() {
  if (process.env.ORIX_INSTALL_DIR) return process.env.ORIX_INSTALL_DIR; // tests
  return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Programs', 'ORIX');
}

/** True when this copy handed over to the installed ORIX (and must stop now). */
function moveHome() {
  if (!app.isPackaged || process.platform !== 'win32') return false;
  const here = path.dirname(process.execPath), home = installHome();
  if (same(here, home) || !fs.existsSync(path.join(here, 'resources', 'app', 'package.json'))) return false;
  const log = msg => { try { const d = path.join(app.getPath('userData'), 'updates'); fs.mkdirSync(d, { recursive: true }); fs.appendFileSync(path.join(d, 'install.log'), new Date().toISOString() + ' ' + msg + '\n'); } catch (e) {} };
  const exe = path.join(home, path.basename(process.execPath));
  const mine = app.getVersion(), there = versionIn(home);
  try {
    if (!fs.existsSync(home) && fs.existsSync(home + '.old')) {
      log('installation backup requires restoration: ' + home + '.old');
      return false;
    }
    if (!there || compareVersions(mine, there) > 0) {
      // copy next to it first and swap after: a half copy never replaces a working ORIX
      const fresh = home + '.new', old = home + '.old';
      fs.rmSync(fresh, { recursive: true, force: true });
      fs.cpSync(here, fresh, { recursive: true, force: true, filter: src => !/[\\/]resources[\\/]app\.(next|prev)([\\/]|$)/i.test(src) });
      if (fs.existsSync(home)) { fs.rmSync(old, { recursive: true, force: true }); fs.renameSync(home, old); } // fails while that ORIX runs: then we keep it
      // a virus scanner often holds new files for a moment: try again, and if it never works, put the old ORIX back
      if (!retry(() => fs.renameSync(fresh, home))) {
        if (fs.existsSync(old)) retry(() => fs.renameSync(old, home));
        throw new Error('the new files stayed busy');
      }
      fs.rmSync(old, { recursive: true, force: true });
      log('installed ' + mine + ' from ' + here + (there ? ' (was ' + there + ')' : ''));
    }
  } catch (e) {
    log('could not install ' + mine + ' from ' + here + ': ' + e.message);
    try { fs.rmSync(home + '.new', { recursive: true, force: true }); } catch (x) {}
    if (!fs.existsSync(exe)) return false; // nothing installed yet: just run from here
  }
  // "Start with Windows" moves along to the installed copy
  try {
    if (app.getLoginItemSettings({ path: process.execPath }).openAtLogin) {
      app.setLoginItemSettings({ openAtLogin: false, path: process.execPath });
      app.setLoginItemSettings({ openAtLogin: true, path: exe });
    }
  } catch (e) {}
  if (process.env.ORIX_INSTALL_DRYRUN) { log('dry run: would start ' + exe); return true; }
  spawn(exe, process.argv.slice(1), { detached: true, stdio: 'ignore', cwd: home }).unref();
  return true;
}

const handedOver = moveHome();
if (handedOver) app.exit(0);

module.exports = { handedOver, installHome };
