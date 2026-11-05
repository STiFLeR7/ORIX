'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { stageApplication, validateRuntime } = require('../tools/make-package.cjs');

test('application staging includes runtime entry points and licenses, excludes local and development material', t => {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-package-test-'));
  t.after(() => fs.rmSync(dest, { recursive: true, force: true }));
  const root = path.resolve(__dirname, '..');
  stageApplication(root, dest);
  for (const file of ['main.js', 'preload.js', 'mascot.html', 'settings-app.html', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'ORIX-REMOVAL.md', 'assets/icon.ico', 'assets/licenses/CODEX-APACHE-2.0.txt', 'assets/licenses/CODEX-NOTICE.txt', 'assets/licenses/RIPGREP-15.2.0-MIT.txt', 'assets/licenses/PCRE2-10.45-LICENCE.md', 'vscode-editor/extension.js']) {
    assert.ok(fs.existsSync(path.join(dest, file)), file);
  }
  for (const file of ['recovered', '.verification', 'dist', 'node_modules', '.env', 'dashboard-rewamp', 'tests', 'tools', 'docs']) {
    assert.equal(fs.existsSync(path.join(dest, file)), false, file);
  }
  assert.equal(JSON.parse(fs.readFileSync(path.join(dest, 'package.json'))).main, 'main.js');
  for (const file of ['README.md', 'LEES-MIJ.md', 'UPDATES.md', 'THIRD_PARTY_NOTICES.md', 'ORIX-REMOVAL.md']) {
    const content = fs.readFileSync(path.join(dest, file), 'utf8');
    for (const match of content.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      const target = match[1];
      if (!/^(https?:|mailto:)/i.test(target)) assert.ok(fs.existsSync(path.join(dest, target)), `${file}: ${target}`);
    }
  }
});

test('runtime version must match the pinned patched Electron version', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-version-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'version'), '44.5.1');
  assert.throws(() => validateRuntime(root, '44.10.1'), /version mismatch/);
  fs.writeFileSync(path.join(root, 'version'), '44.10.1');
  assert.doesNotThrow(() => validateRuntime(root, '44.10.1'));
});
