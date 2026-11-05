#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Explicit runtime allowlist: local profiles and design/restoration files never enter a package.
const SOURCE = [
  'main.js', 'preload.js', 'mascot.html', 'orix-brand-ui.js', 'orix-layer-main.cjs',
  'orix-appearance-ui.js', 'orix-theme.css', 'orix-icons-ui.js', 'orix-navigation-ui.js', 'orix-dashboard.css',
  'orix-layer.css', 'orix-layer-ui.js',
  'orix-copy.cjs', 'orix-compat.cjs',
  'ai-monitor-main.cjs', 'ai-monitor-model.cjs', 'ai-monitor-ui.js', 'ai-settings-ui.js',
  'auto-update-core.cjs', 'auto-update.cjs', 'buddy-helper.ps1', 'buddy-look.ps1',
  'buddy-main.cjs', 'buddy-preload.js', 'buddy-ui.js', 'buddy.html', 'chat-ui.js',
  'chatgpt-provider.js', 'check-windows.cjs', 'claude-code-hooks.cjs', 'companion-service.cjs',
  'extras-main.cjs', 'extras-ui.js', 'focus-ui.js', 'i18n-ui.js', 'icons-ui.js',
  'island-window-main.js', 'island-window-ui.js', 'license-main.cjs', 'pages-ui.js',
  'project-agent-main.js', 'project-editor-main.js', 'project-mode-main.js', 'project-mode-ui.js',
  'self-install.cjs', 'settings-app-main.cjs', 'settings-app-preload.js', 'settings-app.html',
  'settings-bridge-ui.js', 'spotify-ui.js', 'tools-ui.js', 'tray-main.cjs', 'orix-fun.js',
  'orix-reply.cjs', 'orix-statusline.cjs', 'volume-watch.ps1', 'windows-ai-access.cs',
  'windows-ai-access.ps1', 'package.json', 'package-lock.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md',
  'README.md', 'LEES-MIJ.md', 'UPDATES.md', 'assets', 'vscode-editor'
];

function stageApplication(root, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const file of SOURCE) {
    fs.cpSync(path.join(root, file), path.join(dest, file), {
      recursive: true, filter: source => {
        if (fs.lstatSync(source).isSymbolicLink()) throw new Error('Runtime source cannot contain symbolic links');
        const name = path.basename(source);
        return !name.startsWith('.') && name !== 'node_modules';
      }
    });
  }
  const readme = path.join(root, 'PACKAGED-README.md');
  if (fs.lstatSync(readme).isSymbolicLink()) throw new Error('Runtime source cannot contain symbolic links');
  fs.copyFileSync(readme, path.join(dest, 'README.md'));
  const removal = path.join(root, 'docs', 'ORIX-REMOVAL.md');
  if (fs.lstatSync(removal).isSymbolicLink()) throw new Error('Runtime source cannot contain symbolic links');
  fs.copyFileSync(removal, path.join(dest, 'ORIX-REMOVAL.md'));
}

function validateRuntime(runtime, expected) {
  const actual = fs.readFileSync(path.join(runtime, 'version'), 'utf8').trim();
  if (actual !== expected) throw new Error(`Electron version mismatch: expected ${expected}, got ${actual}`);
}

function trimCodexVoice(appSource) {
  const vendor = path.join(appSource, 'node_modules', '@openai', `codex-${process.platform}-${process.arch}`, 'vendor');
  const root = fs.realpathSync(appSource) + path.sep;
  for (const target of fs.readdirSync(vendor)) {
    const voice = path.join(vendor, target, 'codex-resources', 'voice');
    if (!fs.existsSync(voice)) continue;
    if (!fs.realpathSync(voice).startsWith(root)) throw new Error('Voice payload must remain inside package staging');
    // ORIX uses Codex text app-server/exec, with no real-time voice entry point.
    fs.rmSync(voice, { recursive: true });
  }
}

function build() {
  const root = path.resolve(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const runtime = path.join(root, 'node_modules/electron/dist');
  validateRuntime(runtime, pkg.devDependencies.electron);
  const zipTool = process.env.ORIX_7ZIP || '7z';
  const npmCli = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  if (!fs.existsSync(npmCli)) throw new Error('Run this command using npm run package:windows so the npm CLI can be located');
  const scratch = path.join(root, '.verification');
  fs.mkdirSync(scratch, { recursive: true });
  const stage = fs.mkdtempSync(path.join(scratch, 'orix-package-'));
  const appRoot = path.join(stage, 'ORIX');
  // Windows 10/11 provide D3DCompiler through the OS, so its SDK redistributable is unnecessary.
  fs.cpSync(runtime, appRoot, { recursive: true, filter: source => path.basename(source) !== 'd3dcompiler_47.dll' });
  fs.renameSync(path.join(appRoot, 'electron.exe'), path.join(appRoot, 'ORIX.exe'));
  const defaultApp = path.join(appRoot, 'resources/default_app.asar');
  if (fs.existsSync(defaultApp)) fs.unlinkSync(defaultApp);
  const appSource = path.join(appRoot, 'resources/app');
  stageApplication(root, appSource);
  execFileSync(process.execPath, [npmCli, 'ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: appSource, stdio: 'inherit' });
  trimCodexVoice(appSource);
  const dist = path.join(root, 'dist');
  fs.mkdirSync(dist, { recursive: true });
  const zip = path.join(dist, `ORIX-Windows-${pkg.version}.zip`);
  // 7-Zip updates existing archives; removing just this output prevents stale packaged files.
  if (fs.existsSync(zip)) fs.unlinkSync(zip);
  execFileSync(zipTool, ['a', '-tzip', '-mx=5', zip, 'ORIX'], { cwd: stage, stdio: 'inherit' });
  fs.writeFileSync(path.join(scratch, 'orix-package-latest.json'), JSON.stringify({ stage, zip, version: pkg.version, electron: pkg.devDependencies.electron }, null, 2));
  console.log('Packaged', zip);
}

module.exports = { stageApplication, validateRuntime, trimCodexVoice };
if (require.main === module) build();
