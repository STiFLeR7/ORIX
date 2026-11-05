#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Explicit runtime allowlist keeps profiles and development material outside the package.
const SOURCE = [
  'src/main.js', 'src/preload.js', 'src/mascot.html', 'src/orix-brand-ui.js', 'src/orix-layer-main.cjs',
  'src/orix-appearance-ui.js', 'src/orix-theme.css', 'src/orix-icons-ui.js', 'src/orix-navigation-ui.js', 'src/orix-dashboard.css',
  'src/orix-layer.css', 'src/orix-layer-ui.js',
  'src/orix-copy.cjs', 'src/orix-compat.cjs',
  'src/ai-monitor-main.cjs', 'src/ai-monitor-model.cjs', 'src/ai-monitor-ui.js', 'src/ai-settings-ui.js',
  'src/auto-update-core.cjs', 'src/auto-update.cjs', 'src/buddy-helper.ps1', 'src/buddy-look.ps1',
  'src/buddy-main.cjs', 'src/buddy-preload.js', 'src/buddy-ui.js', 'src/buddy.html', 'src/chat-ui.js',
  'src/chatgpt-provider.js', 'src/claude-code-hooks.cjs', 'src/companion-service.cjs',
  'src/extras-main.cjs', 'src/extras-ui.js', 'src/focus-ui.js', 'src/i18n-ui.js', 'src/icons-ui.js',
  'src/island-window-main.js', 'src/island-window-ui.js', 'src/license-main.cjs', 'src/pages-ui.js',
  'src/project-agent-main.js', 'src/project-editor-main.js', 'src/project-mode-main.js', 'src/project-mode-ui.js',
  'src/self-install.cjs', 'src/settings-app-main.cjs', 'src/settings-app-preload.js', 'src/settings-app.html',
  'src/settings-bridge-ui.js', 'src/spotify-ui.js', 'src/tools-ui.js', 'src/tray-main.cjs', 'src/orix-fun.js',
  'src/orix-reply.cjs', 'src/orix-statusline.cjs', 'src/volume-watch.ps1', 'src/windows-ai-access.cs',
  'src/windows-ai-access.ps1', 'package.json', 'package-lock.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md',
  'README.md', 'docs/GETTING-STARTED.md', 'docs/UPDATES.md', 'assets', 'src/vscode-editor',
  'docs/ORIX-REMOVAL.md', 'tools/check-windows.cjs'
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
  const readme = path.join(root, 'docs/PACKAGED-README.md');
  if (fs.lstatSync(readme).isSymbolicLink()) throw new Error('Runtime source cannot contain symbolic links');
  const content = fs.readFileSync(readme, 'utf8').replace(/\]\(([^)]+)\)/g, (link, target) =>
    /^(?:[a-z]+:|#)/i.test(target) ? link : '](' + path.posix.normalize('docs/' + target) + ')');
  fs.writeFileSync(path.join(dest, 'README.md'), content);
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
