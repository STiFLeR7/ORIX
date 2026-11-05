// The parts of the updater that don't need Electron (so they can be tested with `node --test`).
// Retained ZIP/version/signature primitives; ORIX has no automatic update installer.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/** 1.2.0-beta.2 < 1.2.0-beta.10 < 1.2.0 < 1.3.0-beta.1. */
function compareVersions(a, b) {
  const parse = v => {
    const [core, pre = ''] = String(v).trim().replace(/^v/i, '').split(/-(.*)/s);
    const nums = core.split('.').map(n => parseInt(n, 10) || 0);
    while (nums.length < 3) nums.push(0);
    return [nums.slice(0, 3), pre === '' ? [] : pre.split('.')];
  };
  const [ca, pa] = parse(a), [cb, pb] = parse(b);
  for (let i = 0; i < 3; i++) if (ca[i] !== cb[i]) return ca[i] < cb[i] ? -1 : 1;
  if (!pa.length && !pb.length) return 0;
  if (!pa.length) return 1;
  if (!pb.length) return -1;
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (pa[i] === undefined) return -1;
    if (pb[i] === undefined) return 1;
    const x = pa[i], y = pb[i], nx = /^\d+$/.test(x), ny = /^\d+$/.test(y);
    if (nx && ny) { if (+x !== +y) return +x < +y ? -1 : 1; continue; }
    if (nx !== ny) return nx ? -1 : 1;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

const validVersion = v => /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(String(v));

/** Ed25519 public key from the raw 32 bytes (base64). */
function publicKeyFromBase64(b64) {
  const raw = Buffer.from(String(b64).trim(), 'base64');
  if (raw.length !== 32) throw new Error('public key must be 32 bytes');
  return crypto.createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), raw]), format: 'der', type: 'spki' });
}

function rawPublicKeyBase64(keyObject) {
  return keyObject.export({ format: 'der', type: 'spki' }).subarray(-32).toString('base64');
}

/** Checks a downloaded update: size, SHA-256 and the Ed25519 signature over the zip bytes. Throws when wrong. */
function verifyPackage(buf, info, publicKey) {
  if (!Buffer.isBuffer(buf)) throw new Error('no data');
  if (buf.length !== Number(info.size)) throw new Error('size does not match');
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== String(info.sha256).toLowerCase()) throw new Error('sha256 does not match');
  const sig = Buffer.from(String(info.signature || ''), 'base64');
  if (sig.length !== 64 || !crypto.verify(null, buf, publicKey, sig)) throw new Error('signature is not valid');
  return true;
}

function signPackage(buf, privateKey) {
  return crypto.sign(null, buf, privateKey).toString('base64');
}

// ---------- a small zip writer (deflate), enough for the app files ----------
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = buf => { if (typeof zlib.crc32 === 'function') return zlib.crc32(buf) >>> 0; let c = 0xffffffff; for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const dosTime = d => ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff;
const dosDate = d => (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;

/** files: [{ name: 'main.js', data: Buffer, date?: Date }] → zip Buffer. */
function makeZip(files) {
  const locals = [], centrals = []; let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name.replace(/\\/g, '/'), 'utf8');
    const data = f.data, comp = zlib.deflateRawSync(data, { level: 9 }), crc = crc32(data), d = f.date || new Date();
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
    local.writeUInt16LE(dosTime(d), 10); local.writeUInt16LE(dosDate(d), 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(name.length, 26); local.writeUInt16LE(0, 28);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(8, 10);
    central.writeUInt16LE(dosTime(d), 12); central.writeUInt16LE(dosDate(d), 14); central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comp.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, comp); centrals.push(central, name);
    offset += local.length + name.length + comp.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

/** Unpacks a zip made by makeZip (or any zip with stored/deflated files) into dest. Refuses paths outside dest. */
function extractZip(buf, dest) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const root = path.resolve(dest);
  fs.mkdirSync(root, { recursive: true });
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('broken zip directory');
    const method = buf.readUInt16LE(p + 10), crc = buf.readUInt32LE(p + 16), csize = buf.readUInt32LE(p + 20), size = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    p += 46 + nlen + xlen + clen;
    const target = path.resolve(root, name);
    if (target !== root && !target.startsWith(root + path.sep)) throw new Error('unsafe path in zip: ' + name);
    if (name.endsWith('/')) { fs.mkdirSync(target, { recursive: true }); continue; }
    if (buf.readUInt32LE(local) !== 0x04034b50) throw new Error('broken zip entry: ' + name);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + csize);
    const data = method === 0 ? Buffer.from(raw) : method === 8 ? zlib.inflateRawSync(raw) : null;
    if (!data) throw new Error('unsupported zip method for ' + name);
    if (data.length !== size || crc32(data) !== crc) throw new Error('damaged file in zip: ' + name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
  }
}

/**
 * Helper that runs after TwoCode has quit (TwoCode.exe started as plain Node, so no PowerShell or console is needed):
 * it waits for the app to end, swaps resourcespp for resourcespp.next, keeps the old version as
 * resourcespp.prev and starts TwoCode again when asked. If anything fails, the old version stays (or comes back).
 * Arguments: <pid> <resources folder> <TwoCode.exe> <relaunch 1|0> <log file>
 */
function swapHelperSource() {
  return `const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const [pid, res, exe, relaunch, log] = process.argv.slice(2);
const note = m => { try { fs.appendFileSync(log, new Date().toISOString() + ' ' + m + '\\n'); } catch (e) {} };
const alive = p => { try { process.kill(Number(p), 0); return true; } catch (e) { return e.code === 'EPERM'; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const start = () => { if (relaunch !== '1') return; const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE; spawn(exe, [], { detached: true, stdio: 'ignore', env }).unref(); };
(async () => {
  for (let i = 0; i < 300 && alive(pid); i++) await sleep(200);
  await sleep(400);
  const app = path.join(res, 'app'), next = path.join(res, 'app.next'), prev = path.join(res, 'app.prev');
  if (!fs.existsSync(path.join(next, 'package.json'))) { note('no staged update'); return start(); }
  let moved = false;
  for (let i = 0; i < 40 && !moved; i++) {
    try { fs.rmSync(prev, { recursive: true, force: true }); fs.renameSync(app, prev); moved = true; } catch (e) { await sleep(500); }
  }
  if (!moved) { note('could not move the old version (files in use); keeping it'); return start(); }
  try { fs.renameSync(next, app); note('installed'); }
  catch (e) { note('swap failed: ' + e.message); try { fs.renameSync(prev, app); } catch (x) { note('could not put the old version back: ' + x.message); } }
  start();
})();
`;
}

/** Files of the app as shipped in resources\app: tracked + new (not ignored) files, without dist/. */
function appFileList(repo, gitList) {
  return gitList
    .map(f => f.trim()).filter(Boolean)
    .filter(f => !/^dist\//.test(f) && !/^\.git\//.test(f))
    .filter(f => { try { return fs.statSync(path.join(repo, f)).isFile(); } catch (e) { return false; } });
}

module.exports = { compareVersions, validVersion, publicKeyFromBase64, rawPublicKeyBase64, verifyPackage, signPackage, makeZip, extractZip, crc32, swapHelperSource, appFileList };
