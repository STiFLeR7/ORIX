'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { pathToFileURL } = require('node:url');
const project = path.resolve(__dirname, '../src');
const { observe, Session, questionFrom } = require(project + '/ai-monitor-model.cjs');
const { setup, NativeWorker } = require(project + '/ai-monitor-main.cjs');
const target = { id: '7:123:456', handle: 123, pid: 7, started: '456', process: 'chrome', title: 'ChatGPT' };
test('native monitor reports unsupported platforms and shutdown in English', () => {
  assert.throws(() => new NativeWorker({ platform: 'linux' }).start(), /This integration requires Windows/);
  const closed = new NativeWorker(); closed.close();
  assert.throws(() => closed.start(), /ORIX is shutting down/);
});
test('plan buttons pass feedback and the simulated session to the handler', () => {
  const vm = require('node:vm');
  const source = fs.readFileSync(project + '/ai-monitor-ui.js', 'utf8');
  const start = source.indexOf("    bind('am-plan-ok'");
  const end = source.indexOf("    bind('am-jump'", start);
  assert.ok(start >= 0 && end > start);
  const handlers = {}, calls = [];
  const context = { p: { sessionId: 'synthetic', simulated: true },
    root: { querySelector: selector => selector === '#am-plan-note' ? { value: 'Please add tests first.' } : null },
    bind: (id, fn) => { handlers[id] = fn; }, hooks: (...args) => calls.push(args) };
  vm.runInNewContext(source.slice(start, end), context);
  handlers['am-plan-no'](); handlers['am-plan-ok']();
  assert.deepEqual(calls, [
    ['aiMonitorHooksPlan', 'synthetic', false, 'Please add tests first.', true],
    ['aiMonitorHooksPlan', 'synthetic', true, '', true]
  ]);
});
test('question UI submits multiple selections and custom answers to the right session', () => {
  const vm = require('node:vm');
  const source = fs.readFileSync(project + '/ai-monitor-ui.js', 'utf8');
  const script = source.slice(source.indexOf('  let askKey ='), source.indexOf('  // Plans are Markdown'));
  const button = (q, o) => ({ dataset: { q: String(q), o: String(o) }, pressed: 'true', selected: true,
    classList: { remove() { this.owner.selected = false; } }, setAttribute(_name, value) { this.pressed = value; },
    addEventListener(_type, fn) { this.click = fn; } });
  const choices = [button(0, 0), button(0, 1), button(1, 0)], handlers = {}, calls = [];
  for (const choice of choices) choice.classList.owner = choice;
  const input = { dataset: { other: '1' }, value: '', addEventListener(type, fn) { handlers[type] = fn; } };
  const context = { escape: String, T: (_nl, en) => en, pending: false,
    root: { querySelectorAll: selector => selector === '[data-q]' ? choices : [input] },
    bind: (_id, fn) => { handlers.send = fn; }, render() {}, hooks: (...args) => calls.push(args) };
  vm.runInNewContext(script + '\nglobalThis.questionUI = { askForm, bindAsk };', context);
  const session = { sessionId: 'synthetic', simulated: true, ask: [
    { question: 'Choose features', multiSelect: true, options: [{ label: 'A' }, { label: 'B' }] },
    { question: 'Choose a colour', multiSelect: false, options: [{ label: 'Blue' }] }
  ] };
  let html = context.questionUI.askForm(session);
  assert.match(html, /aria-pressed="false"[^>]*data-q="0" data-o="0"/);
  context.questionUI.bindAsk(session);
  choices[0].click(); choices[1].click(); choices[0].click();
  html = context.questionUI.askForm(session);
  assert.match(html, /aria-pressed="false"[^>]*data-q="0" data-o="0"/);
  assert.match(html, /aria-pressed="true"[^>]*data-q="0" data-o="1"/);
  choices[2].click(); input.value = '  Teal  '; handlers.input();
  assert.equal(choices[2].selected, false); assert.equal(choices[2].pressed, 'false');
  assert.equal(choices[1].selected, true);
  handlers.send();
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['aiMonitorHooksAnswer', 'synthetic', {
    'Choose features': ['B'], 'Choose a colour': 'Teal'
  }, true]]);
  const immediate = context.questionUI.askForm({ sessionId: 'single', ask: [session.ask[1]] });
  assert.doesNotMatch(immediate, /aria-pressed=/);
});
function snapshot(options = {}) {
  const names = options.names || ['Welke kleur wil je gebruiken?'];
  const nodes = [
    { type: 'Document', name: 'ChatGPT' }, { type: 'Text', name: 'ChatGPT zei:' },
    ...names.map(name => ({ type: 'Text', name })),
    ...(options.copy === false ? [] : [{ type: 'Button', name: 'Copy' }]),
    ...(options.stop ? [{ type: 'Button', name: 'Stop generating' }] : []),
    { type: 'Edit', automationId: 'prompt-textarea', name: 'Ask anything' },
    { type: 'Button', name: 'Send message' }
  ].map((n, index) => ({ enabled: true, parent: 0, id: 'n' + index, index, ...n }));
  return { ok: true, provider: options.provider || 'chatgpt', contextKey: options.contextKey || target.id + ':https://chatgpt.com/c/first', nodes, truncated: false, ...options.extra };
}
test('browser monitor uses English for its own status and preserves external details', () => {
  assert.equal(observe(null, 'chatgpt').detail, 'Window unavailable.');
  assert.equal(observe({ ok: false, error: 'Extern detail' }, 'chatgpt').detail, 'Extern detail');
  assert.equal(observe(snapshot({ provider: 'claude' }), 'chatgpt').detail, 'The selected window no longer shows this conversation.');
  assert.equal(observe(snapshot({ extra: { truncated: true } }), 'chatgpt').detail, 'The window does not provide enough readable information. Open the latest reply.');
  assert.equal(observe(snapshot({ stop: true }), 'chatgpt').activity, 'Generating a reply');
  assert.equal(new Session('chatgpt', target).detail, 'Checking connection');
});
test('orange question is taken from the last assistant message, not from a user prompt', () => {
  const obs = observe(snapshot(), 'chatgpt');
  assert.equal(obs.valid, true); assert.equal(obs.question, 'Welke kleur wil je gebruiken?');
  assert.equal(obs.assistant.guards.length, 1);
  const data = snapshot(); data.nodes.splice(3, 0, { index: 2.5, id: 'user', type: 'Text', name: 'Je zei:' });
  assert.equal(observe(data, 'chatgpt').question, '');
  assert.equal(questionFrom('Voorbeeld: welke kleur wil je?'), '');
  assert.equal(questionFrom('> Welke kleur wil je?'), '');
});
test('a question near the end, or "type 1 or 2", also waits for you; a plain summary does not', () => {
  assert.notEqual(questionFrom('Wat wil je dat ik doe?\n\n1. Skill\n2. Lade\n\nTyp gewoon **1** of **2**.'), '');
  assert.notEqual(questionFrom('Klaar.\n\nWil je dat ik ook de tests draai?\n\nDan weet je zeker dat alles werkt.'), '');
  assert.notEqual(questionFrom('Het staat klaar. Zeg het maar.'), '');
  assert.equal(questionFrom('Wil je dit?\n\n- regel 1\n- regel 2\n- regel 3\n\nAlles werkt en is opgeslagen.'), '');
  assert.equal(questionFrom('Klaar! De app staat open.'), '');
  assert.equal(questionFrom('Klaar.\n```\nwil je dit?\n```'), '');
});
function claudeTurns(last) {
  // Mirrors the 2026 claude.ai accessibility tree: "Message N of M" groups with a role summary line.
  const raw = [
    [0, -1, 'Document', 'Claude'],
    [1, 0, 'Group', 'Message 1 of 2'], [2, 1, 'Text', 'You said: help'], [3, 1, 'Text', 'help'],
    [4, 0, 'Group', 'Message 2 of 2'],
    ...(last === 'user'
      ? [[5, 4, 'Text', 'You said: nog iets'], [6, 4, 'Text', 'nog iets']]
      : [[5, 4, 'Text', 'Claude responded: Druk op Ctrl+O.'], [6, 4, 'Group', ''], [7, 6, 'Text', 'Druk op '],
        [8, 6, 'Text', ''], [9, 8, 'Text', 'Ctrl+O'], [10, 6, 'Text', '.'], [11, 4, 'Group', ''],
        [12, 11, 'Text', 'Wil je dat ik het voor je doe?'], [13, 4, 'ToolBar', 'Message actions'], [14, 13, 'Button', 'Copy']]),
    [20, 0, 'Edit', 'Write your prompt to Claude', 'tiptap ProseMirror'], [21, 0, 'Button', 'Send message']
  ];
  const nodes = raw.map(([index, parent, type, name, className]) => ({ index, parent, type, name, className, id: 'c' + index, enabled: true }));
  return { ok: true, provider: 'claude', contextKey: target.id + ':https://claude.ai/chat/x', nodes, truncated: false };
}
test('Claude message turns: full reply is read, inline pieces join, question is orange', () => {
  const obs = observe(claudeTurns(), 'claude');
  assert.equal(obs.valid, true); assert.equal(obs.completed, true);
  assert.equal(obs.assistant.text, 'Druk op Ctrl+O.\nWil je dat ik het voor je doe?');
  assert.equal(obs.question.endsWith('Wil je dat ik het voor je doe?'), true);
  assert.equal(observe(claudeTurns('user'), 'claude').assistant, null);
});
test('unidentified composer, passwords and a different provider are rejected', () => {
  const data = snapshot(); data.nodes.find(n => n.type === 'Edit').automationId = 'search'; data.nodes.find(n => n.type === 'Edit').name = 'Search';
  assert.equal(observe(data, 'chatgpt').valid, false);
  const password = snapshot(); password.nodes.find(n => n.type === 'Edit').password = true;
  assert.equal(observe(password, 'chatgpt').valid, false);
  assert.equal(observe(snapshot(), 'claude').valid, false);
});
test('observed busy, stable completion, question and a later answer follow the traffic light states', () => {
  const session = new Session('chatgpt', target);
  assert.equal(session.accept(observe(snapshot({ names: ['Ik denk na.'], stop: true, copy: false }), 'chatgpt'), 1000).state, 'running');
  const end = observe(snapshot(), 'chatgpt');
  assert.equal(session.accept(end, 3600).state, 'running');
  assert.equal(session.accept(end, 6200).state, 'question'); assert.equal(session.notification, 'question');
  assert.equal(session.public().canReply, true);
  session.accept(observe(snapshot({ names: ['Groen wordt toegepast.'], stop: true, copy: false }), 'chatgpt'), 8000);
  session.accept(observe(snapshot({ names: ['Groen is toegepast.'] }), 'chatgpt'), 10600);
  const done = session.accept(observe(snapshot({ names: ['Groen is toegepast.'] }), 'chatgpt'), 13200);
  assert.equal(done.state, 'done'); assert.equal(session.notification, 'done'); assert.equal(done.elapsed, 5);
  session.accept(observe(snapshot({ names: ['Groen is toegepast.'] }), 'chatgpt'), 20000);
  assert.equal(session.notification, null); assert.equal(session.public().elapsed, 5);
  assert.equal('percent' in done, false);
});
test('closed/hidden window, changed conversation and incomplete tree never become green', () => {
  for (const unavailable of [observe({ ok: false, error: 'Gesloten' }, 'chatgpt'), observe(snapshot({ extra: { truncated: true } }), 'chatgpt')]) {
    const session = new Session('chatgpt', target);
    session.accept(observe(snapshot({ stop: true }), 'chatgpt'), 1000);
    assert.equal(session.accept(unavailable, 3600).state, 'unavailable'); assert.equal(session.notification, null);
    assert.notEqual(session.accept(observe(snapshot({ names: ['Klaar.'] }), 'chatgpt'), 6200).state, 'done');
  }
  const session = new Session('chatgpt', target); session.accept(observe(snapshot({ stop: true }), 'chatgpt'), 1000);
  // another chat: Robo follows it, but it never turns green by itself
  assert.equal(session.accept(observe(snapshot({ contextKey: target.id + ':https://chatgpt.com/c/other' }), 'chatgpt'), 3600).state, 'ready');
  assert.equal(session.notification, null);
});
test('long generation still waits for final response controls; a timeout is unavailable, never done', () => {
  const session = new Session('chatgpt', target);
  session.accept(observe(snapshot({ stop: true }), 'chatgpt'), 1000);
  session.accept(observe(snapshot({ stop: true }), 'chatgpt'), 80000);
  assert.equal(session.accept(observe(snapshot({ copy: false }), 'chatgpt'), 82600).state, 'running');
  assert.equal(session.accept(observe(snapshot({ copy: false }), 'chatgpt'), 106000).state, 'unavailable');
  assert.equal(session.notification, null);
});
test('a short response between polls becomes green only after final controls and a stable changed reply', () => {
  const session = new Session('chatgpt', target);
  session.accept(observe(snapshot({ names: ['Oud antwoord.'] }), 'chatgpt'), 1000);
  assert.equal(session.accept(observe(snapshot({ names: ['Nieuw antwoord.'] }), 'chatgpt'), 3600).state, 'running');
  assert.equal(session.notification, null);
  assert.equal(session.accept(observe(snapshot({ names: ['Nieuw antwoord.'] }), 'chatgpt'), 6200).state, 'done');
  assert.equal(session.notification, 'done');
  session.accept({ valid: false, detail: 'Niet leesbaar' }, 8800);
  session.accept(observe(snapshot({ names: ['Nog een antwoord.'] }), 'chatgpt'), 11400);
  assert.notEqual(session.accept(observe(snapshot({ names: ['Nog een antwoord.'] }), 'chatgpt'), 14000).state, 'done');
});
test('explicit stopped and failure messages are red', () => {
  assert.equal(new Session('chatgpt', target).accept(observe(snapshot({ names: ['Genereren gestopt'] }), 'chatgpt')).state, 'stopped');
  assert.equal(new Session('chatgpt', target).accept(observe(snapshot({ names: ['Something went wrong'] }), 'chatgpt')).state, 'error');
});
test('Claude adapter recognizes a named response group and does not read sibling user text', () => {
  const data = snapshot({ provider: 'claude' }); data.nodes = [
    { index: 0, parent: -1, id: 'doc', type: 'Document', name: 'Claude' },
    { index: 1, parent: 0, id: 'answer', type: 'Group', className: 'font-claude-message', name: '' },
    { index: 2, parent: 1, id: 'question', type: 'Text', name: 'Which colour would you like?' },
    { index: 3, parent: 0, id: 'copy', type: 'Button', name: 'Copy', enabled: true },
    { index: 4, parent: 0, id: 'editor', type: 'Edit', name: 'Reply...', enabled: true }
  ];
  const obs = observe(data, 'claude'); assert.equal(obs.question, 'Which colour would you like?'); assert.equal(obs.completed, true);
});
function backend(worker, hub) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-monitor-')), handlers = new Map(), messages = [], notices = [];
  const app = new EventEmitter(); app.getPath = () => dir; app.whenReady = () => Promise.resolve();
  class Notification extends EventEmitter { constructor(data) { super(); notices.push(data); } show() {} static isSupported() { return true; } }
  const sender = { mainFrame: {}, getURL: () => pathToFileURL(project + '/mascot.html').href, send: (channel, value) => messages.push([channel, value]) };
  const electron = { app, ipcMain: { handle: (name, fn) => handlers.set(name, fn) },
    BrowserWindow: { getAllWindows: () => [{ isDestroyed: () => false, webContents: sender, show() {}, focus() {} }] },
    shell: { openExternal: async () => {} }, Notification };
  const bridge = setup(electron, hub ? { worker, hub } : { worker });
  const call = (name, args) => handlers.get('ai-monitor:' + name)({ sender, senderFrame: sender.mainFrame }, args);
  return { app, call, sender, handlers, bridge, notices, messages, dir, cleanup: () => { bridge.close(); fs.rmSync(dir, { recursive: true, force: true }); } };
}
test('offline test events stay separate from real connection, history and notifications', async () => {
  const events = [];
  const hub = { apply: e => events.push(e), view: agent => ({ agent, connected: false, state: 'disconnected' }), history: () => [], start() {}, stop() {} };
  const h = backend({ request: async () => ({ ok: true }), close() {} }, hub);
  try {
    for (const [kind, expected] of [['busy', 'running'], ['question', 'question'], ['done', 'done'], ['error', 'error']]) {
      const result = await h.call('hooks-test', { kind });
      assert.equal(result.simulation.state, expected);
      assert.equal(result.simulation.simulated, true);
      assert.equal(result.simulation.name, 'Claude Code (test)');
      assert.equal(result.simulation.source.title, 'Test simulation');
      assert.match(result.simulation.prompt, /^[\x20-\x7e]+$/);
      assert.equal(result.simulation.detail, { running: 'Working', question: 'Waiting for you', done: 'Done', error: 'Error' }[expected]);
      assert.equal(result.providers[2].connected, false);
    }
    assert.equal((await h.call('hooks-test', { kind: 'clear' })).simulation, null);
    const broadcasts = h.messages.filter(([channel]) => channel === 'ai-monitor:state').map(([, value]) => value.simulation);
    assert.ok(broadcasts.some(simulation => simulation?.state === 'running' && simulation.simulated));
    assert.equal(broadcasts.at(-1), null);
    for (const [kind, method, payload] of [
      ['demo-perm', 'hooks-decide', { behavior: 'allow' }],
      ['demo-ask', 'hooks-answer', { answers: { 'Which colour should the button be?': 'Blue' } }],
      ['demo-plan', 'hooks-plan', { approve: true, feedback: '' }]
    ]) {
      const demo = (await h.call('hooks-test', { kind })).simulation;
      assert.equal(demo.simulated, true);
      assert.equal((await h.call(method, { ...payload, sessionId: demo.sessionId, simulated: true })).ok, true);
      assert.equal((await h.call('hooks-test', { kind: 'clear' })).simulation, null);
    }
    assert.deepEqual(events, []); assert.deepEqual(h.bridge.view().history, []); assert.equal(h.notices.length, 0);
  } finally { h.cleanup(); }
});
test('layer lists simulation separately and keeps active real activity first', () => {
  const vm = require('node:vm');
  const source = fs.readFileSync(project + '/ai-monitor-ui.js', 'utf8');
  const providers = source.slice(source.indexOf('  const providers ='), source.indexOf('  const current ='));
  const top = source.slice(source.indexOf('  const PRIORITY ='), source.indexOf('  // A colour-blind friendly palette', source.indexOf('  const PRIORITY =')));
  const context = { state: { providers: [{ provider: 'claudecode', connected: true, state: 'running' }], simulation: { simulated: true, connected: true, state: 'question', canReply: true, permission: { tool: 'Bash' } } },
    shown: p => p.connected && p.state !== 'ready' };
  vm.runInNewContext(`${providers}\n${top}\nthis.items = providers(); this.first = top();`, context);
  assert.equal(context.items.length, 2);
  assert.equal(context.items[1].provider, 'claudecode-test');
  assert.equal(context.items[1].canReply, false);
  assert.equal(context.items[1].permission.tool, 'Bash');
  assert.equal(context.first.provider, 'claudecode');
  assert.equal(context.state.providers[0].provider, 'claudecode');
});
test('the AI home widget visibly identifies test sessions', () => {
  const vm = require('node:vm');
  const source = fs.readFileSync(project + '/ai-monitor-ui.js', 'utf8');
  const start = source.indexOf('  const widgetAgentLabel =');
  const end = source.indexOf('  function claudeWidget(', start);
  assert.ok(start >= 0 && end > start, 'widget label helper must exist');
  const context = {};
  vm.runInNewContext(source.slice(start, end) + '\nthis.nameFor = widgetAgentLabel;', context);
  assert.equal(context.nameFor({ simulated: true, agent: 'claude' }), 'Test · Claude');
  assert.equal(context.nameFor({ agent: 'claude' }), 'Claude Code');
  assert.equal(context.nameFor({ agent: 'codex' }), 'Codex');
  const widget = source.slice(end, source.indexOf('  function ', end + 11));
  assert.match(widget, /label\(widgetAgentLabel\(p\)/);
});
test('real handlers: connect, stale question denial, explicit guarded reply, confirmation, completion and no duplicate notification', async () => {
  let current = snapshot(), reads = 0; const commands = [];
  const worker = { async request(method, args) {
    commands.push([method, args]);
    if (method === 'windows') return { ok: true, windows: [target] };
    if (method === 'read') { reads++; return current; }
    if (method === 'reply') { current = snapshot({ stop: true, copy: false, names: ['Ik werk verder.'] }); return { ok: true }; }
    return { ok: true };
  }, close() {} };
  const h = backend(worker);
  try {
    await h.call('windows'); assert.equal((await h.call('connect', { provider: 'chatgpt', targetId: target.id })).ok, true);
    const q = h.bridge.view().providers[0]; assert.equal(q.state, 'question'); assert.equal(h.notices.length, 0);
    assert.equal((await h.call('reply', { provider: 'chatgpt', questionId: 'stale', text: 'Groen' })).ok, false);
    assert.equal(commands.filter(([m]) => m === 'reply').length, 0);
    const result = await h.call('reply', { provider: 'chatgpt', questionId: q.questionId, text: 'Groen' });
    assert.equal(result.confirmed, true); assert.equal(h.bridge.view().providers[0].state, 'running');
    const command = commands.find(([m]) => m === 'reply')[1]; assert.equal(command.text, 'Groen'); assert.equal(command.composerId, 'n4'); assert.equal(command.guards[0].name, 'Welke kleur wil je gebruiken?');
    current = snapshot({ names: ['Het is groen.'] }); await h.bridge.poll(); await h.bridge.poll();
    assert.equal(h.bridge.view().providers[0].state, 'done'); assert.equal(h.notices.length, 1);
    await h.bridge.poll(); assert.equal(h.notices.length, 1);
    await h.call('disconnect', { provider: 'chatgpt' }); assert.equal(h.bridge.view().providers[0].connected, false);
    assert.ok(reads >= 5);
  } finally { h.cleanup(); }
});
test('foreign IPC windows cannot inspect or send; changed native question never gets a reply command', async () => {
  let current = snapshot(), replies = 0;
  const h = backend({ request: async method => method === 'windows' ? { ok: true, windows: [target] } : method === 'read' ? current : (replies++, { ok: true }), close() {} });
  try {
    const denied = await h.handlers.get('ai-monitor:windows')({ sender: { getURL: () => 'https://example.com/' } }); assert.equal(denied.ok, false);
    await h.call('windows'); await h.call('connect', { provider: 'chatgpt', targetId: target.id }); const id = h.bridge.view().providers[0].questionId;
    current = snapshot({ names: ['Welke maat wil je?'] });
    assert.equal((await h.call('reply', { provider: 'chatgpt', questionId: id, text: 'Groen' })).ok, false); assert.equal(replies, 0);
  } finally { h.cleanup(); }
});
test('native worker uses shell=false, parses split UTF-8 JSONL and cannot restart after close', async () => {
  let child, args;
  const worker = new NativeWorker({ platform: 'win32', spawn(executable, argv, options) {
    args = { executable, argv, options }; child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.stdin = new EventEmitter(); child.kill = () => {};
    child.stdin.write = (line, cb) => { const request = JSON.parse(line); const data = Buffer.from(JSON.stringify({ id: request.id, result: { ok: true, text: 'vraag 👻' } }) + '\n');
      setImmediate(() => { child.stdout.emit('data', data.subarray(0, data.length - 4)); child.stdout.emit('data', data.subarray(data.length - 4)); }); cb?.(); };
    return child;
  } });
  assert.equal((await worker.request('read', {})).text, 'vraag 👻'); assert.equal(args.options.shell, false); assert.ok(args.argv.includes('-Mta'));
  worker.close(); await assert.rejects(worker.request('windows'), /shutting down/);
});

test('monitor IPC rejects subframes of the desktop layer', async () => {
  const h = backend({ request: async () => ({ ok: true, windows: [] }), close() {} });
  try {
    const result = await h.handlers.get('ai-monitor:windows')({ sender: h.sender, senderFrame: {} });
    assert.equal(result.ok, false); assert.equal((await h.call('windows')).ok, true);
  } finally { h.cleanup(); }
});


test('cancelled quit leaves the AI monitor active until shutdown actually completes', async () => {
  let closes = 0, stops = 0;
  const hub = { view: agent => ({ agent, connected: false, state: 'disconnected' }), history: () => [], start() {}, stop() { stops++; } };
  const h = backend({ request: async () => ({ ok: true }), close() { closes++; } }, hub);
  try {
    await Promise.resolve();
    assert.equal((await h.call('hooks-test', { kind: 'busy' })).simulation.state, 'running');
    h.app.emit('before-quit', { defaultPrevented: true });
    assert.equal(closes, 0); assert.equal(stops, 0);
    assert.equal((await h.call('hooks-test', { kind: 'done' })).simulation.state, 'done');
    h.app.emit('will-quit'); assert.equal(closes, 1); assert.equal(stops, 1);
  } finally { h.cleanup(); }
});
