'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { stageApplication } = require('../tools/make-package.cjs');

const root = path.resolve(__dirname, '..');

test('normal desktop-layer startup resolves its document inside src', () => {
  const source = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
  const call = source.match(/mascotWindow\.loadFile\([\s\S]*?\);/);
  assert.ok(call);
  let document;
  vm.runInNewContext(call[0], { mascotWindow: { loadFile: file => { document = file; } }, path, __dirname: path.join(root, 'src') });
  assert.equal(document, path.join(root, 'src/mascot.html'));
  assert.ok(fs.existsSync(document));
});

test('repository root keeps project metadata while application code lives in src', () => {
  const files = fs.readdirSync(root, { withFileTypes: true }).filter(entry => entry.isFile()).map(entry => entry.name);
  assert.deepEqual(files.filter(file => /\.(?:c?js|html|css|ps1|cs|cmd)$/i.test(file)), []);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
  assert.equal(pkg.main, 'src/main.js');
  assert.equal(pkg.scripts['check:windows'], 'node tools/check-windows.cjs');
  for (const file of ['src/main.js', 'src/preload.js', 'src/vscode-editor/orix-project-editor.vsix', 'tools/START-ORIX.cmd', 'tools/CHECK-WINDOWS.cmd', 'docs/CONTRIBUTING.md', 'docs/RELEASE.md', 'docs/TESTING.md', 'docs/design/orix-system/DESIGN-SYSTEM.md', 'docs/reviews/website/orix-v3-check.js']) assert.ok(fs.existsSync(path.join(root, file)), file);
});

test('packaged renderer documents resolve local scripts, styles and assets from src', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-layout-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  stageApplication(root, directory);
  const pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json')));
  assert.equal(pkg.main, 'src/main.js');
  assert.ok(fs.existsSync(path.join(directory, pkg.main)));
  for (const name of ['mascot.html', 'settings-app.html', 'buddy.html']) {
    const file = path.join(directory, 'src', name);
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']|\burl\(["']?([^)'"\s]+)["']?\)/gi)) {
      const reference = match[1] || match[2];
      if (/^(?:[a-z]+:|#)/i.test(reference) || reference.includes('${')) continue;
      assert.ok(fs.existsSync(path.resolve(path.dirname(file), reference.split(/[?#]/)[0])), `${name} -> ${reference}`);
    }
  }
  for (const file of ['tools/check-windows.cjs', 'docs/UPDATES.md', 'docs/ORIX-REMOVAL.md', 'assets/icon.ico', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) assert.ok(fs.existsSync(path.join(directory, file)), file);
});

test('design preview resolves images produced by the relocated shared icon helper', () => {
  const preview = path.join(root, 'docs/design/orix-preview.html');
  const declaration = fs.readFileSync(preview, 'utf8').split('\n').find(line => line.startsWith('const icon='));
  assert.ok(declaration);
  for (const name of ['claudecode', 'codex', 'chatgpt']) {
    const html = vm.runInNewContext(declaration + '\nicon(name)', { ORIXIcons: require('../src/orix-icons-ui.js'), name });
    for (const match of html.matchAll(/src="([^"]+)"/g)) assert.ok(fs.existsSync(path.resolve(path.dirname(preview), match[1])), name + ' -> ' + match[1]);
  }
});

test('website documentation links resolve to current repository paths', () => {
  const app = path.join(root, 'ORIX-WEBSITE/app');
  for (const file of fs.readdirSync(app, { recursive: true }).filter(name => name.endsWith('.tsx'))) {
    const source = fs.readFileSync(path.join(app, file), 'utf8');
    for (const match of source.matchAll(/\$\{repo\}\/blob\/main\/([^`]+)`/g)) assert.ok(fs.existsSync(path.join(root, match[1].split('#')[0])), file + ' -> ' + match[1]);
  }
});
