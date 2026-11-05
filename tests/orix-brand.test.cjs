const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('ORIX layer mark uses the approved aperture and retains the status indicator', () => {
  const drawing = [], calls = [];
  const canvasContext = new Proxy({}, { get: (_, key) => (...args) => drawing.push([key, ...args]), set: (_, key, value) => { drawing.push([key, value]); return true; } });
  const canvas = { width: 0, height: 0, getContext: () => canvasContext };
  const sandbox = { window: {}, document: { createElement: () => canvas, documentElement: { dataset: { theme: 'dark' } } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../orix-brand-ui.js'), 'utf8'), sandbox);
  const ctx = new Proxy({}, { get: (_, key) => (...args) => calls.push([key, ...args]), set: (_, key, value) => { calls.push([key, value]); return true; } });
  sandbox.window.__orixMark(ctx, 20, 30, 40, '#ffb000');
  assert.deepEqual(calls[0], ['save']);
  assert.ok(calls.some(c => c[0] === 'drawImage' && c[1] === canvas && c[2] === 0 && c[3] === 10 && c[4] === 40 && c[5] === 40));
  assert.ok(drawing.some(c => c[0] === 'globalCompositeOperation' && c[1] === 'destination-out'));
  assert.ok(drawing.filter(c => c[0] === 'stroke').length === 2, 'aperture has both approved openings');
  assert.ok(calls.some(c => c[0] === 'fillStyle' && c[1] === '#ffb000'), 'status remains visible');
  assert.deepEqual(calls.at(-1), ['restore']);
});

test('packaged Windows and tray icons use the approved 86% tile artwork', () => {
  const crypto = require('node:crypto');
  const assets = path.join(__dirname, '../assets');
  const selected = fs.readFileSync(path.join(assets, 'orix-icon.svg'), 'utf8');
  assert.match(selected, /scale\(\.86\)/);
  assert.match(selected, /#111318/i);
  assert.match(selected, /#F4F5F7/i);
  const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(assets, file))).digest('hex');
  assert.equal(digest('tray.png'), digest('icon-16.png'));
  assert.equal(digest('settings-icon.ico'), digest('icon.ico'));
});

const settings = fs.readFileSync(path.join(__dirname, '../settings-app.html'), 'utf8');
test('dashboard header uses the selected wordmark in light and dark themes', () => {
  for (const name of ['orix-lockup-light.svg', 'orix-lockup-dark.svg']) {
    assert.match(settings, new RegExp(name.replace('.', '\\.')));
    assert.ok(fs.existsSync(path.join(__dirname, '../assets', name)), name);
  }
});

test('dashboard brand provides readable text in high-contrast mode', () => {
  const css = fs.readFileSync(path.join(__dirname, '../orix-dashboard.css'), 'utf8');
  assert.match(settings, /class="brand-high-contrast"[^>]*>ORIX</);
  assert.match(css, /data-high-contrast=true[^{}]*\.brand-high-contrast/);
  assert.match(css, /@media\s*\(forced-colors:\s*active\)/);
});

test('both desktop marks pulse busy status and keep questions steady without leaking canvas alpha', () => {
  const mascot = fs.readFileSync(path.join(__dirname, '../mascot.html'), 'utf8');
  const source = mascot.slice(mascot.indexOf('function drawGhost('), mascot.indexOf('window.__orixIslandEyes = drawIslandEyes;'));
  let status, time, alpha;
  const stack = [];
  const ctx = { globalAlpha: 0.8, save() { stack.push(this.globalAlpha); }, restore() { this.globalAlpha = stack.pop(); } };
  const sandbox = { ctx, performance: { now: () => time }, window: { __orixEyes: () => status, __orixMark: () => { alpha = ctx.globalAlpha; } } };
  vm.runInNewContext(source, sandbox);
  for (const draw of [sandbox.drawGhost, sandbox.drawIslandEyes]) {
    status = { color: '#ff9a1f', blink: true };
    time = 0; draw(20, 30); const peak = alpha;
    time = Math.PI * 200; draw(20, 30); const trough = alpha;
    assert.ok(trough < peak, 'running/sending status must visibly pulse');
    assert.ok(trough > 0, 'busy mark stays visible');
    assert.equal(ctx.globalAlpha, 0.8, 'canvas alpha must be restored');
    status = { color: '#ff9a1f' };
    draw(20, 30); assert.equal(alpha, 0.8, 'question status must stay steady');
    sandbox.window.__orixResolvedAppearance = () => ({ reducedMotion: true });
    status = { color: '#ff9a1f', blink: true };
    time = Math.PI * 200; draw(20, 30); assert.equal(alpha, 0.8, 'reduced motion keeps busy status steady');
    delete sandbox.window.__orixResolvedAppearance;
  }
});

test('News renders manual updates without installing or offering a legacy download', () => {
  const source = settings.slice(settings.indexOf('function drawNews()'), settings.indexOf('// ---------- Home ----------'));
  let html;
  const sandbox = { tab: 'news', news: { ok: true, version: '0.1.0-beta.1', releases: [], manual: true }, upd: { enabled: false }, lang: 'en', esc: String, icon: () => '', t: () => ({ yours: v => `ORIX ${v}` }), paint: value => { html = value; } };
  vm.runInNewContext(source + '\ndrawNews();', sandbox);
  assert.match(html, /ORIX 0\.1\.0-beta\.1/);
  assert.match(html, /Manual updates/);
  assert.match(html, /Automatic update checks and downloads are disabled/);
  assert.doesNotMatch(html, /https?:|data-news="install"|data-url=/);
});

test('Apps offers free tool switches without purchase or activation controls', () => {
  const apps = settings.slice(settings.indexOf('const APPS ='), settings.indexOf('async function loadApps'));
  const draw = settings.slice(settings.indexOf('function drawApps()'), settings.indexOf('// ---------- Nieuws ----------'));
  let html;
  const sandbox = { ORIXNavigation: require('../orix-navigation-ui.js'), tab: 'apps', lang: 'en', esc: String, icon: () => '', t: () => ({ always: 'Always on', inApp: 'Enabled', notIn: 'Disabled', soon: 'More tools', soonHelp: 'Free tools' }), paint: value => { html = value; } };
  vm.runInNewContext(apps + draw + '\ndrawApps();', sandbox);
  for (const id of ['focus', 'tray', 'clips', 'note', 'spotify']) assert.ok(html.includes(`data-app="${id}"`), id);
  assert.doesNotMatch(html, /packCode|data-code=|data-url=|🔒/);
  assert.doesNotMatch(settings, /license\.activate|unlockCode|https:\/\/orix\.nl/);
});

test('legacy license actions keep every bundled tool unlocked without a code', () => {
  const handlers = {};
  const sandbox = { require: name => { assert.equal(name, 'electron'); return { ipcMain: { handle: (name, handler) => { handlers[name] = handler; } } }; }, module: { exports: {} } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../license-main.cjs'), 'utf8'), sandbox);
  const trusted = { senderFrame: { url: 'file:///app/settings-app.html' } };
  for (const action of ['get', 'activate', 'remove']) {
    const result = handlers[`license:${action}`](trusted, '');
    assert.equal(result.free, true);
    assert.equal(result.code, '');
    assert.equal(result.locked.length, 0);
    for (const tool of ['focus', 'tray', 'clips', 'note', 'spotify']) assert.ok(result.apps.includes(tool), tool);
    assert.equal(handlers[`license:${action}`]({ senderFrame: { url: 'https://example.com/' } }, ''), null);
  }
});
