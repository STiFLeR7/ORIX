'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const previous = ['two', 'code'].join('');
const root = path.resolve(__dirname, '..');

test('published source and filenames use the ORIX identity', () => {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const matches = [];
  const retired = ['re', 'covery'].join('');
  for (const file of files) {
    if (!fs.existsSync(path.join(root, file))) continue;
    const bytes = fs.readFileSync(path.join(root, file));
    const text = bytes.includes(0) ? '' : bytes.toString().toLowerCase();
    if ([previous, retired].some(word => file.toLowerCase().includes(word) || text.includes(word))) matches.push(file);
  }
  assert.deepEqual(matches, []);
});

test('profile migration preserves originals, existing destinations and raw chat text', t => {
  const { migrateProfile } = require('../orix-compat.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-identity-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const old = path.join(dir, previous + '-project-chats.json');
  const content = JSON.stringify({ text: previous + ' is user-authored text' });
  fs.writeFileSync(old, content);
  fs.writeFileSync(path.join(dir, previous + '-project.json'), '{"old":true}');
  fs.writeFileSync(path.join(dir, 'orix-project.json'), '{"new":true}');
  migrateProfile(dir);
  assert.equal(fs.readFileSync(path.join(dir, 'orix-project-chats.json'), 'utf8'), content);
  assert.equal(fs.readFileSync(old, 'utf8'), content);
  assert.equal(fs.readFileSync(path.join(dir, 'orix-project.json'), 'utf8'), '{"new":true}');
  migrateProfile(dir);
  assert.equal(fs.readFileSync(path.join(dir, 'orix-project-chats.json'), 'utf8'), content);
});

test('renderer migration runs before settings readers and preserves current preferences', () => {
  const data = new Map([[previous + ':prefs', '{"themeMode":"light"}'], [previous + ':sound', 'false'], ['orix:sound', 'true'], ['unrelated', 'keep']]);
  const localStorage = { get length() { return data.size; }, key: index => [...data.keys()][index], getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'orix-compat.cjs'), 'utf8'), { window: {}, localStorage });
  assert.equal(data.get('orix:prefs'), '{"themeMode":"light"}');
  assert.equal(data.get('orix:sound'), 'true');
  assert.equal(data.get(previous + ':prefs'), '{"themeMode":"light"}');
  assert.equal(data.get('unrelated'), 'keep');
  const html = fs.readFileSync(path.join(root, 'mascot.html'), 'utf8');
  assert.ok(html.indexOf('src="./orix-compat.cjs"') < html.indexOf('<script>'));
});

test('earlier launch variables remain usable while explicit ORIX values win', () => {
  const { migrateEnvironment } = require('../orix-compat.cjs');
  const env = { [previous.toUpperCase() + '_INSTALL_DIR']: 'disposable-profile', [previous.toUpperCase() + '_AI_MODEL']: 'earlier-model', ORIX_AI_MODEL: 'current-model' };
  migrateEnvironment(env);
  assert.equal(env.ORIX_INSTALL_DIR, 'disposable-profile');
  assert.equal(env.ORIX_AI_MODEL, 'current-model');
  assert.equal(Object.hasOwn(env, 'ORIX_OPENAI_API_KEY'), false);
});

test('profile migration does not publish a partial file when copying fails', t => {
  const { migrateProfile } = require('../orix-compat.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-identity-failure-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, previous + '-project.json'), 'preserve');
  const copy = fs.copyFileSync;
  fs.copyFileSync = (source, destination) => { fs.writeFileSync(destination, 'partial'); throw Object.assign(new Error('disk full'), { code: 'ENOSPC' }); };
  try { assert.throws(() => migrateProfile(dir), /disk full/); }
  finally { fs.copyFileSync = copy; }
  assert.equal(fs.existsSync(path.join(dir, 'orix-project.json')), false);
  assert.deepEqual(fs.readdirSync(dir), [previous + '-project.json']);
  migrateProfile(dir);
  assert.equal(fs.readFileSync(path.join(dir, 'orix-project.json'), 'utf8'), 'preserve');
});

test('bundled editor archive matches its ORIX source and manifest', t => {
  const { extractZip } = require('../auto-update-core.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-editor-identity-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  extractZip(fs.readFileSync(path.join(root, 'vscode-editor/orix-project-editor.vsix')), dir);
  for (const file of ['package.json', 'extension.js']) assert.deepEqual(fs.readFileSync(path.join(dir, 'extension', file)), fs.readFileSync(path.join(root, 'vscode-editor', file)));
  const manifest = fs.readFileSync(path.join(dir, 'extension.vsixmanifest'), 'utf8');
  assert.match(manifest, /Publisher="orix"/);
  assert.match(manifest, /Version="0\.2\.0"/);
  assert.equal(manifest.toLowerCase().includes(previous), false);
});

test('deleted runtime settings do not return from a previous storage snapshot', () => {
  const { migrateStorage } = require('../orix-compat.cjs');
  const data = new Map([[previous + ':focus-end', '100']]);
  const storage = { get length() { return data.size; }, key: index => [...data.keys()][index], getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  migrateStorage(storage);
  data.delete('orix:focus-end');
  migrateStorage(storage);
  assert.equal(data.has('orix:focus-end'), false);
});

test('earlier encrypted provider settings keep their credentials and selected provider', () => {
  const source = fs.readFileSync(path.join(root, 'project-mode-main.js'), 'utf8');
  const body = source.slice(source.indexOf('function loadAISettingsRaw()'), source.indexOf('function saveAISettingsRaw('));
  const result = vm.runInNewContext(body + '\nloadAISettingsRaw()', {
    require: name => { assert.equal(name, './orix-compat.cjs'); return require('../orix-compat.cjs'); },
    readJson: () => ({ provider: previous, [previous + 'DevKey']: 'encrypted-synthetic-value' }),
    AI_SETTINGS_FILE: () => 'unused', ALLOWED_OPENAI_MODELS: new Set(), DEFAULT_OPENAI_MODEL: 'fixture-model'
  });
  assert.equal(result.provider, 'orix');
  assert.equal(result.orixDevKey, 'encrypted-synthetic-value');
});
