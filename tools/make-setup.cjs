#!/usr/bin/env node
// Makes ORIX-Setup-<version>.exe: one file people double-click (tools/setup/Setup.cs). It holds the full
// ORIX-Windows zip and installs it in %LOCALAPPDATA%\Programs\ORIX, starts ORIX and explains how it works.
//
//   node tools/make-setup.cjs <path to ORIX-Windows-<version>.zip>
//
// Uses the C# compiler that comes with Windows (.NET Framework 4), so nothing has to be installed.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const zip = process.argv[2];
if (!zip || !fs.existsSync(zip)) { console.error('Give the full ORIX-Windows zip: node tools/make-setup.cjs <zip>'); process.exit(1); }
const version = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8')).version;
if (!path.basename(zip).includes(version)) { console.error('That zip is not version ' + version + ' (package.json).'); process.exit(1); }
const nums = version.split('-')[0].split('.').map(Number), beta = Number((/(\d+)$/.exec(version.split('-')[1] || '') || [0, 0])[1]);
const asmVersion = [...nums, beta].join('.'); // 1.2.0-beta.5 → 1.2.0.5

const csc = path.join(process.env.WINDIR || 'C:\\Windows', 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe');
const fw = path.dirname(csc);
const out = path.join(repo, 'dist'); fs.mkdirSync(out, { recursive: true });
const src = path.join(out, 'Setup.generated.cs');
fs.writeFileSync(src, '\ufeff' + fs.readFileSync(path.join(__dirname, 'setup', 'Setup.cs'), 'utf8').replace(/\{\{VERSION\}\}/g, version).replace(/\{\{ASMVERSION\}\}/g, asmVersion));
const exe = path.join(out, 'ORIX-Setup-' + version + '.exe');
execFileSync(csc, ['/nologo', '/target:winexe', '/optimize+', '/codepage:65001', '/platform:anycpu',
  '/out:' + exe, '/win32icon:' + path.join(repo, 'assets', 'icon.ico'),
  '/resource:' + path.resolve(zip) + ',ORIX.zip', '/resource:' + path.join(repo, 'assets', 'icon-256.png') + ',orix.png',
  ...['System.dll', 'System.Drawing.dll', 'System.Windows.Forms.dll', 'System.IO.Compression.dll', 'System.IO.Compression.FileSystem.dll'].map(r => '/r:' + path.join(fw, r)),
  src], { stdio: 'inherit' });
fs.unlinkSync(src);
console.log(path.relative(repo, exe) + '  (' + (fs.statSync(exe).size / 1048576).toFixed(1) + ' MB)');
