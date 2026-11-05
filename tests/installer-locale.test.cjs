const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawn } = require('node:child_process');

test('installer preserves a stranded backup when the install folder is missing', { skip: process.platform !== 'win32' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-installer-backup-'));
  try {
    const app = path.join(dir, 'app'), backup = app + '.old', payload = path.join(dir, 'payload');
    fs.mkdirSync(backup); fs.mkdirSync(payload);
    fs.writeFileSync(path.join(backup, 'ORIX.exe'), 'original installation');
    fs.writeFileSync(path.join(payload, 'ORIX.exe'), 'replacement installation');
    const zip = path.join(dir, 'payload.zip');
    const quote = s => "'" + s.replaceAll("'", "''") + "'";
    const ps = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory(${quote(payload)}, ${quote(zip)})`;
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(ps, 'utf16le').toString('base64')], { stdio: 'pipe' });
    const fw = path.join(process.env.WINDIR || 'C:\\Windows', 'Microsoft.NET/Framework64/v4.0.30319');
    const source = fs.readFileSync(path.join(__dirname, '../tools/setup/Setup.cs'), 'utf8')
      .replaceAll('{{ASMVERSION}}', '0.1.0.1').replaceAll('{{VERSION}}', '0.1.0-beta.1');
    fs.writeFileSync(path.join(dir, 'Setup.cs'), '\ufeff' + source);
    fs.writeFileSync(path.join(dir, 'Check.cs'), `using System;
class Check { static int Main(string[] args) { try { Installer.Run(args[0], null); return 2; }
  catch (Exception e) { return e.Message.ToLowerInvariant().Contains(args.Length > 1 ? args[1] : "backup") ? 0 : 3; } } }`);
    const check = path.join(dir, 'Check.exe');
    execFileSync(path.join(fw, 'csc.exe'), ['/nologo', '/target:exe', '/main:Check', '/codepage:65001', '/out:' + check,
      '/resource:' + zip + ',ORIX.zip', ...['System.dll', 'System.Drawing.dll', 'System.Windows.Forms.dll', 'System.IO.Compression.dll', 'System.IO.Compression.FileSystem.dll'].map(r => '/r:' + path.join(fw, r)),
      path.join(dir, 'Setup.cs'), path.join(dir, 'Check.cs')], { stdio: 'pipe' });
    execFileSync(check, [app], { timeout: 15000, stdio: 'pipe' });
    assert.equal(fs.readFileSync(path.join(backup, 'ORIX.exe'), 'utf8'), 'original installation');
    assert.equal(fs.existsSync(app), false);
    assert.equal(fs.existsSync(app + '.new'), false);

    const swap = '() => Directory.Move(fresh, home)', restore = '() => Directory.Move(old, home)';
    assert.ok(source.includes(swap) && source.includes(restore));
    for (const restoreFails of [false, true]) {
      const target = path.join(dir, restoreFails ? 'restore-fails' : 'swap-fails'); fs.mkdirSync(target);
      fs.writeFileSync(path.join(target, 'ORIX.exe'), 'original installation');
      let injected = source.replace(swap, '() => { throw new IOException("synthetic swap failure"); }').replace('Thread.Sleep(250)', 'Thread.Sleep(1)');
      if (restoreFails) injected = injected.replace(restore, '() => { throw new IOException("synthetic restore failure"); }');
      fs.writeFileSync(path.join(dir, 'Setup.cs'), '\ufeff' + injected);
      execFileSync(path.join(fw, 'csc.exe'), ['/nologo', '/target:exe', '/main:Check', '/codepage:65001', '/out:' + check,
        '/resource:' + zip + ',ORIX.zip', ...['System.dll', 'System.Drawing.dll', 'System.Windows.Forms.dll', 'System.IO.Compression.dll', 'System.IO.Compression.FileSystem.dll'].map(r => '/r:' + path.join(fw, r)),
        path.join(dir, 'Setup.cs'), path.join(dir, 'Check.cs')], { stdio: 'pipe' });
      execFileSync(check, [target, restoreFails ? 'backup' : 'windows kept'], { timeout: 15000, stdio: 'pipe' });
      assert.equal(fs.readFileSync(path.join(restoreFails ? target + '.old' : target, 'ORIX.exe'), 'utf8'), 'original installation');
      assert.equal(fs.existsSync(target + '.new'), restoreFails);
    }
  } finally {
    if (!path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw new Error('Unsafe test cleanup');
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('installer refuses to kill a running app during upgrade', { skip: process.platform !== 'win32' }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-installer-running-'));
  let child;
  try {
    const fw = path.join(process.env.WINDIR || 'C:\\Windows', 'Microsoft.NET/Framework64/v4.0.30319');
    const csc = path.join(fw, 'csc.exe'), app = path.join(dir, 'app'); fs.mkdirSync(app);
    fs.writeFileSync(path.join(dir, 'Sleeper.cs'), 'class Sleeper { static void Main() { System.Threading.Thread.Sleep(60000); } }');
    const exe = path.join(app, 'ORIX.exe');
    execFileSync(csc, ['/nologo', '/target:exe', '/out:' + exe, path.join(dir, 'Sleeper.cs')], { stdio: 'pipe' });
    const source = fs.readFileSync(path.join(__dirname, '../tools/setup/Setup.cs'), 'utf8')
      .replaceAll('{{ASMVERSION}}', '0.1.0.1').replaceAll('{{VERSION}}', '0.1.0-beta.1');
    fs.writeFileSync(path.join(dir, 'Setup.cs'), '\ufeff' + source);
    fs.writeFileSync(path.join(dir, 'Check.cs'), `using System;
class Check { static int Main(string[] args) { try { Installer.Run(args[0], null); return 2; }
  catch (Exception e) { return e.Message.Contains(args.Length > 1 ? "drive root" : "Quit ORIX") ? 0 : 3; } } }`);
    const check = path.join(dir, 'Check.exe');
    execFileSync(csc, ['/nologo', '/target:exe', '/main:Check', '/codepage:65001', '/out:' + check,
      ...['System.dll', 'System.Drawing.dll', 'System.Windows.Forms.dll', 'System.IO.Compression.dll', 'System.IO.Compression.FileSystem.dll'].map(r => '/r:' + path.join(fw, r)),
      path.join(dir, 'Setup.cs'), path.join(dir, 'Check.cs')], { stdio: 'pipe' });
    child = spawn(exe, [], { windowsHide: true });
    await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
    execFileSync(check, [app], { timeout: 15000, stdio: 'pipe' });
    execFileSync(check, [app + path.sep], { timeout: 15000, stdio: 'pipe' });
    execFileSync(check, [path.parse(app).root, 'root'], { timeout: 15000, stdio: 'pipe' });
    assert.equal(child.exitCode, null, 'running app must remain alive');
    assert.equal(fs.existsSync(exe), true);
    assert.equal(fs.existsSync(app + '.new'), false);
  } finally {
    if (child && child.exitCode === null) { child.kill(); await new Promise(resolve => child.once('exit', resolve)); }
    if (!path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw new Error('Unsafe test cleanup');
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('actual installer stays English on English, Dutch and French Windows locales', { skip: process.platform !== 'win32' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-installer-locale-'));
  try {
    const source = fs.readFileSync(path.join(__dirname, '../tools/setup/Setup.cs'), 'utf8')
      .replaceAll('{{ASMVERSION}}', '0.1.0.1').replaceAll('{{VERSION}}', '0.1.0-beta.1');
    fs.writeFileSync(path.join(dir, 'Setup.cs'), '\ufeff' + source);
    fs.writeFileSync(path.join(dir, 'Check.cs'), `using System;
using System.Globalization;
using System.Reflection;
using System.Threading;
class Check {
  [STAThread] static void Main(string[] args) {
    Thread.CurrentThread.CurrentUICulture = CultureInfo.GetCultureInfo(args[0]);
    typeof(Setup).GetMethod("Main", BindingFlags.Static | BindingFlags.NonPublic)
      .Invoke(null, new object[] { new string[] { "--shot", args[1] } });
    using (var form = new SetupForm()) {
      form.ShowReady();
      var field = typeof(SetupForm).GetField("title", BindingFlags.Instance | BindingFlags.NonPublic);
      var label = (System.Windows.Forms.Label)field.GetValue(form);
      if (label.Text != "ORIX is ready") throw new Exception("Installer must stay English");
    }
  }
}`);
    const fw = path.join(process.env.WINDIR || 'C:\\Windows', 'Microsoft.NET/Framework64/v4.0.30319');
    const exe = path.join(dir, 'Check.exe');
    execFileSync(path.join(fw, 'csc.exe'), ['/nologo', '/target:exe', '/main:Check', '/codepage:65001', '/out:' + exe,
      ...['System.dll', 'System.Drawing.dll', 'System.Windows.Forms.dll', 'System.IO.Compression.dll', 'System.IO.Compression.FileSystem.dll'].map(r => '/r:' + path.join(fw, r)),
      path.join(dir, 'Setup.cs'), path.join(dir, 'Check.cs')], { stdio: 'pipe', encoding: 'utf8' });
    const evidence = path.join(__dirname, '../.verification');
    fs.mkdirSync(evidence, { recursive: true });
    for (const locale of ['en-US', 'nl-NL', 'fr-FR']) {
      const shot = path.join(evidence, `installer-${locale}.png`);
      execFileSync(exe, [locale, shot], { stdio: 'pipe', encoding: 'utf8', windowsHide: true });
      assert.ok(fs.statSync(shot).size > 1000);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
