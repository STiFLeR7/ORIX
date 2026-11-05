// node --test tests/auto-update.test.cjs
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawn } = require('child_process');
const core = require('../auto-update-core.cjs');

const win = process.platform === 'win32';
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'orix-update-test-'));
const ps = (args, opts = {}) => execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', ...args], { encoding: 'utf8', windowsHide: true, ...opts });

test('versions compare like semver, prereleases before the release', () => {
  const order = ['1.1.0', '1.2.0-beta.1', '1.2.0-beta.2', '1.2.0-beta.10', '1.2.0-rc.1', '1.2.0', '1.2.1', '1.10.0', '2.0.0-alpha'];
  for (let i = 0; i < order.length; i++) for (let j = 0; j < order.length; j++) {
    assert.strictEqual(core.compareVersions(order[i], order[j]), Math.sign(i - j), order[i] + ' vs ' + order[j]);
  }
  assert.strictEqual(core.compareVersions('v1.2.0', '1.2.0'), 0);
  assert.ok(core.validVersion('1.2.0-beta.3') && !core.validVersion('1.2') && !core.validVersion('latest'));
});

test('a signed package passes; anything changed fails', () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const key = core.publicKeyFromBase64(core.rawPublicKeyBase64(publicKey));
  const buf = Buffer.from('the app files');
  const info = { size: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex'), signature: core.signPackage(buf, privateKey) };
  assert.ok(core.verifyPackage(buf, info, key));
  const evil = Buffer.from('the app filez');
  assert.throws(() => core.verifyPackage(evil, info, key), /sha256/);
  assert.throws(() => core.verifyPackage(evil, { ...info, sha256: crypto.createHash('sha256').update(evil).digest('hex') }, key), /signature/);
  assert.throws(() => core.verifyPackage(buf, { ...info, size: 3 }, key), /size/);
  const other = crypto.generateKeyPairSync('ed25519');
  assert.throws(() => core.verifyPackage(buf, info, core.publicKeyFromBase64(core.rawPublicKeyBase64(other.publicKey))), /signature/);
});

test('the zip unpacks to the same files, with our own unzip and with Windows (Expand-Archive)', () => {
  const dir = tmp();
  const files = [
    { name: 'package.json', data: Buffer.from('{"version":"9.9.9","main":"main.js"}') },
    { name: 'main.js', data: Buffer.from('console.log("hi")\n'.repeat(200)) },
    { name: 'assets/fonts/x.woff2', data: crypto.randomBytes(5000) },
    { name: 'README é.md', data: Buffer.from('ünïcode') },
  ];
  const zip = core.makeZip(files);
  core.extractZip(zip, path.join(dir, 'ours'));
  for (const f of files) assert.deepStrictEqual(fs.readFileSync(path.join(dir, 'ours', f.name)), f.data, f.name);
  if (win) {
    fs.writeFileSync(path.join(dir, 'u.zip'), zip);
    ps(['-Command', `Expand-Archive -LiteralPath '${path.join(dir, 'u.zip')}' -DestinationPath '${path.join(dir, 'win')}' -Force`]);
    for (const f of files) assert.deepStrictEqual(fs.readFileSync(path.join(dir, 'win', f.name)), f.data, 'windows: ' + f.name);
  }
  // a path that leaves the folder is refused
  assert.throws(() => core.extractZip(core.makeZip([{ name: '../evil.txt', data: Buffer.from('x') }]), path.join(dir, 'evil')), /unsafe path/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('the helper waits for ORIX to quit, then swaps app and app.next (and keeps the old one)', async () => {
  const dir = tmp(), res = path.join(dir, 'resources');
  for (const [sub, v] of [['app', '1.0.0'], ['app.next', '1.1.0']]) {
    fs.mkdirSync(path.join(res, sub), { recursive: true });
    fs.writeFileSync(path.join(res, sub, 'package.json'), JSON.stringify({ version: v }));
  }
  const helper = path.join(dir, 'install-update.cjs');
  fs.writeFileSync(helper, core.swapHelperSource());
  const log = path.join(dir, 'log.txt');
  const run = pid => new Promise(resolve => spawn(process.execPath, [helper, String(pid), res, 'unused.exe', '0', log], { stdio: 'ignore' }).on('exit', resolve));
  // stand-in for ORIX.exe: a process that runs for 1.5 seconds
  const fake = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 1500)'], { stdio: 'ignore' });
  const t0 = Date.now();
  await run(fake.pid);
  assert.ok(Date.now() - t0 >= 1200, 'waited for the app to quit');
  const version = sub => JSON.parse(fs.readFileSync(path.join(res, sub, 'package.json'), 'utf8')).version;
  assert.strictEqual(version('app'), '1.1.0');
  assert.strictEqual(version('app.prev'), '1.0.0');
  assert.ok(!fs.existsSync(path.join(res, 'app.next')));
  assert.match(fs.readFileSync(log, 'utf8'), /installed/);
  // nothing staged: nothing changes
  await run(999999);
  assert.strictEqual(version('app'), '1.1.0');
  assert.match(fs.readFileSync(log, 'utf8'), /no staged update/);
  fs.rmSync(dir, { recursive: true, force: true });
});
