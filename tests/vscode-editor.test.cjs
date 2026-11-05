'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');

test('VS Code extension refuses dirty documents and saves an approved synthetic edit', async t => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-vscode-test-'));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  const root = fs.realpathSync(folder), file = path.join(root, 'sample.txt');
  const before = 'hello\n', after = 'world\n'; fs.writeFileSync(file, before);
  const hash = value => crypto.createHash('sha256').update(value).digest('hex');
  const doc = { text: before, version: 1, isDirty: true, eol: 1, getText() { return this.text; },
    positionAt: offset => offset, async save() { fs.writeFileSync(file, this.text); this.isDirty = false; return true; } };
  class WorkspaceEdit { replace(_uri, range, text) { this.change = { range, text }; } }
  class Range { constructor(start, end) { this.start = start; this.end = end; } }
  const editor = { revealRange() {} };
  const vscode = { Uri: { file: value => value }, Range, WorkspaceEdit, Selection: class {}, EndOfLine: { CRLF: 2 },
    TextEditorRevealType: { InCenterIfOutsideViewport: 0 }, window: { showTextDocument: async () => editor },
    workspace: { openTextDocument: async () => doc, async applyEdit(edit) {
      const { range, text } = edit.change; doc.text = doc.text.slice(0, range.start) + text + doc.text.slice(range.end);
      doc.version++; doc.isDirty = true; return true;
    } } };
  const http = { request(_options, callback) {
    const req = new EventEmitter(); req.setTimeout = () => {}; req.end = () => process.nextTick(() => {
      const response = new EventEmitter(); callback(response); response.emit('data', Buffer.from('{"ok":true}')); response.emit('end');
    }); return req;
  } };
  const source = fs.readFileSync(require.resolve('../vscode-editor/extension.js'), 'utf8');
  const context = { exports: {}, require: name => name === 'vscode' ? vscode : name === 'http' ? http : require(name),
    Buffer, process, URLSearchParams, console };
  vm.runInNewContext(source.replace('  exports.activate =', '  exports.__testRun = run;\n  exports.activate ='), context);
  const job = { id: 'synthetic', root, file, kind: 'apply', hash: hash(before), textHash: hash(before),
    targetHash: hash(after), edits: [{ start: 0, end: 5, text: 'world' }] };
  await assert.rejects(context.exports.__testRun(1, 'synthetic', job), /Save your changes in VS Code first/);
  assert.equal(fs.readFileSync(file, 'utf8'), before);
  doc.isDirty = false;
  const result = await context.exports.__testRun(1, 'synthetic', job);
  assert.equal(result.ok, true); assert.equal(result.savedHash, hash(after));
  assert.equal(fs.readFileSync(file, 'utf8'), after);
});

test('project editor accepts only one concurrent ready request per claimed job', async t => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-ready-test-'));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  const root = await fs.promises.realpath(folder), file = path.join(root, 'sample.txt'); fs.writeFileSync(file, 'sample');
  const http = require('node:http'); let quit, statuses, slow = false;
  const storage = Object.create(fs);
  Object.defineProperty(storage, 'promises', { value: { ...fs.promises, async realpath(...args) {
    if (slow) await new Promise(resolve => setTimeout(resolve, 100));
    return fs.promises.realpath(...args);
  } } });
  const electron = { app: { getPath: () => root, on: (event, fn) => { if (event === 'will-quit') quit = fn; } },
    ipcMain: { handle() {} }, shell: { async openExternal(url) {
      const parsed = new URL(url), port = Number(parsed.searchParams.get('port'));
      const id = parsed.searchParams.get('job'), token = parsed.searchParams.get('token');
      const request = (route, method, value) => new Promise((resolve, reject) => {
        const body = value ? JSON.stringify(value) : '';
        const req = http.request({ hostname: '127.0.0.1', port, path: route, method,
          headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}) } },
        res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
        req.on('error', reject); req.end(body);
      });
      assert.equal(await request('/job/' + id, 'GET'), 200);
      fs.writeFileSync(file, 'changed by user');
      assert.equal(await request('/ready', 'POST', { id }), 409);
      assert.equal(fs.readFileSync(file, 'utf8'), 'changed by user');
      fs.writeFileSync(file, 'sample');
      slow = true;
      statuses = (await Promise.all([request('/ready', 'POST', { id }), request('/ready', 'POST', { id })])).sort();
      assert.equal(await request('/complete', 'POST', { id, result: { ok: false, error: 'Synthetic cancellation' } }), 200);
    } } };
  const context = { module: { exports: {} }, require: name => name === 'electron' ? electron : name === 'fs' ? storage : require(name),
    Buffer, process, console, setTimeout, clearTimeout };
  vm.runInNewContext(fs.readFileSync(require.resolve('../project-editor-main.js'), 'utf8'), context);
  const editor = context.module.exports({ resolveProjectFile: async () => ({ root, actual: file, relative: 'sample.txt' }), loadProjectPath: () => root });
  try {
    const before = await editor.fileState('sample.txt');
    await assert.rejects(editor.editor(before, 'check'), /Synthetic cancellation/);
    assert.deepEqual(statuses, [200, 409]);
    assert.equal(fs.readFileSync(file, 'utf8'), 'sample');
  } finally { quit?.(); }
});
