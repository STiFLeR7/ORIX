'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHub, EVENTS, PORT } = require('../claude-code-hooks.cjs');

function temp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orix-hooks-'));
  return { dir, settingsFile: path.join(dir, 'claude', 'settings.json'), cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

test('Codex hook stdin argument is quoted for Windows PowerShell', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex');
  try {
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome });
    hub.installCodex();
    const config = JSON.parse(fs.readFileSync(path.join(codexHome, 'hooks.json'), 'utf8'));
    for (const groups of Object.values(config.hooks)) {
      for (const group of groups) {
        for (const hook of group.hooks) assert(hook.command.includes('--data-binary "@-"'));
      }
    }
  } finally { t.cleanup(); }
});

for (const legacy of ['unquoted stdin', 'background callbacks']) test('starting the hub upgrades older ORIX Codex ' + legacy + ' and preserves other hooks', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex');
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome });
  try {
    hub.installCodex();
    const file = path.join(codexHome, 'hooks.json');
    const config = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const groups of Object.values(config.hooks)) {
      for (const group of groups) {
        for (const hook of group.hooks) {
          if (legacy === 'unquoted stdin') hook.command = hook.command.replace('--data-binary "@-"', '--data-binary @-');
          else hook.async = true;
        }
      }
    }
    const unrelated = { hooks: [{ type: 'command', command: 'echo unrelated' }] };
    config.hooks.SessionStart.push(unrelated);
    fs.writeFileSync(file, JSON.stringify(config));
    assert.equal(hub.codexInstalled(), false);
    hub.start();
    assert.equal(hub.codexInstalled(), true);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).hooks.SessionStart[0], unrelated);
  } finally { hub.stop(); t.cleanup(); }
});

test('older beta callback identities upgrade without removing unrelated hooks', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex');
  const { previous } = require('../orix-compat.cjs');
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome });
  try {
    hub.install(); hub.installCodex();
    const codexFile = path.join(codexHome, 'hooks.json');
    const unrelated = { hooks: [{ type: 'command', command: 'echo unrelated' }] };
    for (const file of [t.settingsFile, codexFile]) {
      const config = JSON.parse(fs.readFileSync(file, 'utf8').replaceAll('/orix-hook', '/' + previous + '-hook').replaceAll('X-ORIX-Token', 'X-' + previous + '-Token').replaceAll('orix-reply.cjs', previous + '-reply.cjs').replaceAll('orix-statusline.cjs', previous + '-statusline.cjs'));
      config.hooks.Stop.unshift(unrelated);
      fs.writeFileSync(file, JSON.stringify(config));
    }
    assert.equal(hub.installed(), false);
    assert.equal(hub.codexInstalled(), false);
    hub.start();
    assert.equal(hub.installed(), true);
    assert.equal(hub.codexInstalled(), true);
    for (const file of [t.settingsFile, codexFile]) {
      const config = JSON.parse(fs.readFileSync(file, 'utf8'));
      assert.deepEqual(config.hooks.Stop[0], unrelated);
      assert.ok(!JSON.stringify(config).includes(previous));
    }
    hub.uninstall(); hub.uninstallCodex();
    for (const file of [t.settingsFile, codexFile]) assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { hooks: { Stop: [unrelated] } });
  } finally { hub.stop(); t.cleanup(); }
});

test('Codex lifecycle hooks finish in order before the session can cancel background work', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex');
  try {
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome });
    hub.installCodex();
    const config = JSON.parse(fs.readFileSync(path.join(codexHome, 'hooks.json'), 'utf8'));
    for (const groups of Object.values(config.hooks)) {
      for (const group of groups) for (const hook of group.hooks) assert.equal(hook.async, false);
    }
  } finally { t.cleanup(); }
});

test('Claude Code failure details use English labels without translating unknown provider text', () => {
  const t = temp(), results = [];
  try {
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, onFinish: session => results.push(session.detail) });
    hub.apply({ session_id: 'known', hook_event_name: 'StopFailure', error_type: 'rate_limit' });
    hub.apply({ session_id: 'unknown', hook_event_name: 'StopFailure', error_type: 'Custom provider detail' });
    assert.deepEqual(results, ['Error: rate limit reached', 'Error: Custom provider detail']);
  } finally { t.cleanup(); }
});

test('hook prompts use English app labels while preserving provider text', () => {
  const t = temp(), results = [];
  try {
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile,
      onFinish: session => results.push({ detail: session.detail, question: session.question, tool: session.permission?.tool }) });
    hub.apply({ session_id: 'permission', hook_event_name: 'PermissionRequest', tool_name: 'Read', tool_input: { file_path: 'Klaar.txt' } });
    hub.apply({ session_id: 'plan', hook_event_name: 'PermissionRequest', tool_name: 'ExitPlanMode', tool_input: { plan: 'Mijn plan' } });
    hub.apply({ session_id: 'provided', hook_event_name: 'Notification', notification_type: 'agent_needs_input', message: 'Mijn eigen vraag?' });
    hub.apply({ session_id: 'fallback', hook_event_name: 'Notification', notification_type: 'agent_needs_input' });
    assert.deepEqual(results, [
      { detail: 'Needs permission', question: 'Reading Klaar.txt:\nKlaar.txt', tool: 'Reading Klaar.txt' },
      { detail: 'Plan ready: approve?', question: 'Claude has created a plan.', tool: 'Plan ready' },
      { detail: 'Waiting for you', question: 'Mijn eigen vraag?', tool: undefined },
      { detail: 'Waiting for you', question: 'Claude Code needs your input.', tool: undefined }
    ]);
  } finally { t.cleanup(); }
});

test('ORIX hook install and uninstall preserve a separate earlier application', () => {
  const t = temp();
  const { previous } = require('../orix-compat.cjs');
  try {
    const oldHttp = { hooks: [{ type: 'http', url: `http://127.0.0.1:47823/${previous}-hook?v=4` }] };
    const oldReply = { hooks: [{ type: 'command', command: `node "C:\\Old\\App\\${previous}-reply.cjs" old-token` }] };
    const original = {
      hooks: { Stop: [oldHttp, oldReply] },
      statusLine: { type: 'command', command: `node "C:\\Old\\App\\${previous}-statusline.cjs" old-token` }
    };
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true });
    fs.writeFileSync(t.settingsFile, JSON.stringify(original));
    const legacyBackup = 'Existing ORIX backup';
    fs.writeFileSync(t.settingsFile + '.' + previous + '-backup', legacyBackup);
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
    hub.install();
    const after = JSON.parse(fs.readFileSync(t.settingsFile, 'utf8'));
    assert.equal(fs.readFileSync(t.settingsFile + '.' + previous + '-backup', 'utf8') === legacyBackup, true, 'legacy backup was preserved');
    assert.equal(JSON.stringify(after.hooks.Stop.slice(0, 2)) === JSON.stringify(original.hooks.Stop), true, 'legacy hooks were preserved');
    assert.deepEqual(after.statusLine, original.statusLine);
    hub.uninstall();
    assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')), original);
  } finally { t.cleanup(); }
});

test('install keeps existing settings and hooks, uninstall removes only ours', () => {
  const t = temp();
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true });
    const own = { hooks: [{ type: 'command', command: 'echo mine' }] };
    fs.writeFileSync(t.settingsFile, JSON.stringify({ model: 'opus', hooks: { Stop: [own] } }));
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
    assert.equal(hub.installed(), false);
    hub.install(); hub.install(); // twice: no duplicates
    const after = JSON.parse(fs.readFileSync(t.settingsFile, 'utf8'));
    assert.equal(after.model, 'opus'); assert.deepEqual(after.hooks.Stop[0], own);
    for (const event of EVENTS) assert.equal(after.hooks[event].filter(g => g.hooks.some(h => h.url?.includes(':' + PORT))).length, 1);
    assert.equal(hub.installed(), true); assert.ok(fs.existsSync(t.settingsFile + '.orix-backup'));
    hub.uninstall();
    assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')), { model: 'opus', hooks: { Stop: [own] } });
  } finally { t.cleanup(); }
});

test('broken settings.json is never overwritten', () => {
  const t = temp();
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.writeFileSync(t.settingsFile, '{ broken');
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
    assert.throws(() => hub.install(), /not valid JSON\. Nothing was changed/);
    assert.equal(fs.readFileSync(t.settingsFile, 'utf8'), '{ broken');
  } finally { t.cleanup(); }
});

test('malformed Codex hook configuration reports English without changing the file', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), file = path.join(codexHome, 'hooks.json');
  try {
    fs.mkdirSync(codexHome); fs.writeFileSync(file, '{ broken');
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome });
    assert.throws(() => hub.installCodex(), /not valid JSON\. Nothing was changed/);
    assert.equal(fs.readFileSync(file, 'utf8'), '{ broken');
  } finally { t.cleanup(); }
});

test('hook events drive the traffic light: busy, question, done, error', () => {
  const t = temp(), finished = [];
  try {
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, onFinish: s => finished.push(s.state) });
    const send = (hook_event_name, extra = {}) => hub.apply({ session_id: 's1', cwd: 'C:\\code\\app', hook_event_name, ...extra });
    send('UserPromptSubmit'); assert.equal(hub.view().connected, false); // not installed, server not running
    send('PreToolUse', { tool_name: 'Edit', tool_input: { file_path: 'C:\\code\\app\\main.js' } });
    send('PermissionRequest', { tool_name: 'Bash' }); assert.deepEqual(finished, ['question']);
    send('PostToolUse');
    send('Stop', { last_assistant_message: 'Klaar. Wil je dat ik ook de tests draai?' }); assert.equal(finished.at(-1), 'question');
    send('UserPromptSubmit'); send('Stop', { last_assistant_message: 'Alles is gefixt.' }); assert.equal(finished.at(-1), 'done');
    send('UserPromptSubmit'); send('StopFailure', { error_type: 'rate_limit' }); assert.equal(finished.at(-1), 'error');
  } finally { t.cleanup(); }
});

test('permission waits for Toestaan in the island and answers Claude Code; a later event releases it', async () => {
  const t = temp();
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
  try {
    hub.install(); hub.start();
    await new Promise(resolve => setTimeout(resolve, 100));
    const token = fs.readFileSync(path.join(t.dir, 'claude-code-hook-token'), 'utf8');
    const post = body => fetch('http://127.0.0.1:' + PORT + '/orix-hook?v=2', { method: 'POST', headers: { 'content-type': 'application/json', 'x-orix-token': token }, body: JSON.stringify(body) });
    const asking = post({ session_id: 'p', cwd: '/w/site', hook_event_name: 'PermissionRequest', tool_name: 'Bash', tool_input: { command: 'npm i' } });
    await new Promise(resolve => setTimeout(resolve, 100));
    const view = hub.view(); assert.equal(view.state, 'question'); assert.equal(view.permission.what, 'npm i');
    hub.decide('p', 'allow');
    const answer = await (await asking).json();
    assert.deepEqual(answer, { hookSpecificOutput: { hookEventName: 'PermissionRequest', decision: { behavior: 'allow', updatedInput: { command: 'npm i' } } } });
    assert.throws(() => hub.decide('p', 'allow'), /already been answered/);
    // Answered in the terminal instead: the next tool event releases the open request with an empty body.
    const second = post({ session_id: 'p', hook_event_name: 'PermissionRequest', tool_name: 'Edit', tool_input: { file_path: '/w/a.js' } });
    await new Promise(resolve => setTimeout(resolve, 100));
    await post({ session_id: 'p', hook_event_name: 'PostToolUse', tool_name: 'Edit' });
    assert.equal(await (await second).text(), ''); assert.equal(hub.view().permission, null);
  } finally { hub.stop(); t.cleanup(); }
});

test('multiple-choice questions and plans are answered from the island; tool counts per turn', async () => {
  const t = temp();
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
  try {
    hub.install(); hub.start();
    await new Promise(resolve => setTimeout(resolve, 100));
    const token = fs.readFileSync(path.join(t.dir, 'claude-code-hook-token'), 'utf8');
    const post = body => fetch('http://127.0.0.1:' + PORT + '/orix-hook', { method: 'POST', headers: { 'content-type': 'application/json', 'x-orix-token': token }, body: JSON.stringify(body) });
    const questions = [{ question: 'Welke kleur?', header: 'Kleur', multiSelect: false, options: [{ label: 'Blauw', description: 'rustig' }, { label: 'Groen', description: '' }] },
      { question: 'Welke delen?', header: 'Delen', multiSelect: true, options: [{ label: 'Knop', description: '' }, { label: 'Titel', description: '' }] }];
    const asking = post({ session_id: 'q', hook_event_name: 'PermissionRequest', tool_name: 'AskUserQuestion', tool_input: { questions } });
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(hub.view().ask.length, 2); assert.equal(hub.view().ask[0].options[0].label, 'Blauw');
    assert.throws(() => hub.answerQuestions('q', { 'Welke kleur?': 'Blauw' }), /each question/);
    hub.answerQuestions('q', { 'Welke kleur?': 'Blauw', 'Welke delen?': ['Knop', 'Titel'] });
    const sent = await (await asking).json();
    assert.deepEqual(sent.hookSpecificOutput.decision, { behavior: 'allow', updatedInput: { questions, answers: { 'Welke kleur?': 'Blauw', 'Welke delen?': 'Knop, Titel' } } });

    const planning = post({ session_id: 'q', hook_event_name: 'PermissionRequest', tool_name: 'ExitPlanMode', tool_input: { plan: '# Plan\n- stap 1' } });
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(hub.view().plan, '# Plan\n- stap 1');
    hub.decidePlan('q', false, 'Eerst de tests');
    const back = await (await planning).json();
    assert.equal(back.hookSpecificOutput.decision.behavior, 'deny'); assert.match(back.hookSpecificOutput.decision.message, /Eerst de tests/);

    for (const tool of ['Read', 'Read', 'Edit', 'Bash']) hub.apply({ session_id: 'q', hook_event_name: 'PostToolUse', tool_name: tool });
    assert.deepEqual(hub.view().stats, { read: 2, edit: 1, run: 1 });
    hub.apply({ session_id: 'q', hook_event_name: 'UserPromptSubmit' });
    assert.deepEqual(hub.view().stats, {});
  } finally { hub.stop(); t.cleanup(); }
});

test('seen: green, red and questions go quiet after you looked; nothing else changes', async () => {
  const t = temp();
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
  try {
    hub.install(); hub.start();
    await new Promise(resolve => setTimeout(resolve, 100));
    hub.apply({ session_id: 'g', hook_event_name: 'Stop', last_assistant_message: 'Klaar.' });
    hub.apply({ session_id: 'r', hook_event_name: 'StopFailure', error_type: 'overloaded' });
    assert.equal(hub.view().state, 'error');
    hub.seen();
    assert.equal(hub.view().state, 'ready'); // eyes back to normal
    hub.apply({ session_id: 'w', hook_event_name: 'UserPromptSubmit' });
    hub.seen();
    assert.equal(hub.view().state, 'running'); // busy work is never hidden
  } finally { hub.stop(); t.cleanup(); }
});

test('status line prints usage and forwards it to the ring; your own status line is never replaced', async () => {
  const t = temp();
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
  try {
    hub.install(); hub.start();
    await new Promise(resolve => setTimeout(resolve, 100));
    const settings = JSON.parse(fs.readFileSync(t.settingsFile, 'utf8'));
    assert.match(settings.statusLine.command, /orix-statusline\.cjs" [a-f0-9]{48}$/);
    const token = settings.statusLine.command.split(' ').at(-1);
    hub.apply({ session_id: 's', hook_event_name: 'UserPromptSubmit' });
    const input = JSON.stringify({ session_id: 's', context_window: { used_percentage: 8.4 },
      rate_limits: { five_hour: { used_percentage: 23.5, resets_at: Math.floor(Date.now() / 1000) + 3600 }, seven_day: { used_percentage: 41.2 } } });
    const { execFileSync } = require('node:child_process');
    const out = execFileSync(process.execPath, [path.join(__dirname, '..', 'orix-statusline.cjs'), token], { input, encoding: 'utf8' });
    assert.equal(out.trim(), 'ORIX · 5 uur: 24% · week: 41% · gesprek: 8% vol');
    await new Promise(resolve => setTimeout(resolve, 150));
    const usage = hub.view().usage;
    assert.equal(usage.fiveHour.used, 24); assert.equal(usage.sevenDay.used, 41); assert.equal(usage.context, 8);

    const own = { type: 'command', command: 'echo mijn eigen balk' };
    fs.writeFileSync(t.settingsFile, JSON.stringify({ ...settings, statusLine: own }));
    hub.install(); hub.uninstall();
    assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')).statusLine, own);
  } finally { hub.stop(); t.cleanup(); }
});

test('answer typed in the island wakes Claude (exit 2); typing in the terminal cancels it (exit 0)', async () => {
  const t = temp();
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
  const { spawn } = require('node:child_process');
  const run = (token, sessionId) => {
    const child = spawn(process.execPath, [path.join(__dirname, '..', 'orix-reply.cjs'), token]);
    let stderr = ''; child.stderr.on('data', d => { stderr += d; });
    child.stdin.end(JSON.stringify({ session_id: sessionId, hook_event_name: 'Stop' }));
    return new Promise(resolve => child.on('exit', code => resolve({ code, stderr })));
  };
  try {
    hub.install(); hub.start();
    await new Promise(resolve => setTimeout(resolve, 100));
    const stop = JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')).hooks.Stop.flatMap(g => g.hooks).find(h => h.type === 'command');
    assert.equal(stop.asyncRewake, true); assert.match(stop.command, /orix-reply\.cjs/);
    const token = stop.command.split(' ').at(-1);

    hub.apply({ session_id: 'r', hook_event_name: 'Stop', last_assistant_message: 'Welke kleur wil je?' });
    const woke = run(token, 'r');
    await new Promise(resolve => setTimeout(resolve, 400));
    assert.equal(hub.view().canReply, true);
    hub.reply('r', 'Blauw graag');
    const result = await woke;
    assert.equal(result.code, 2); assert.match(result.stderr, /Blauw graag/);
    assert.equal(hub.view().state, 'running');

    const cancelled = run(token, 'r');
    await new Promise(resolve => setTimeout(resolve, 400));
    hub.apply({ session_id: 'r', hook_event_name: 'UserPromptSubmit' });
    assert.equal((await cancelled).code, 0);
    assert.throws(() => hub.reply('r', 'te laat'), /no longer waiting/);
  } finally { hub.stop(); t.cleanup(); }
});

test('server only accepts posts with the right token', async () => {
  const t = temp();
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
  try {
    hub.install(); hub.start();
    await new Promise(resolve => setTimeout(resolve, 100));
    const token = fs.readFileSync(path.join(t.dir, 'claude-code-hook-token'), 'utf8');
    const post = (headers, body) => fetch('http://127.0.0.1:' + PORT + '/orix-hook', { method: 'POST', headers, body: JSON.stringify(body) });
    const evil = await post({ 'content-type': 'application/json', 'x-orix-token': 'wrong' }, { session_id: 'x', hook_event_name: 'UserPromptSubmit' });
    assert.equal(evil.status, 403); assert.equal(hub.view().state, 'ready');
    const good = await post({ 'content-type': 'application/json', 'x-orix-token': token }, { session_id: 'x', cwd: '/a/project', hook_event_name: 'UserPromptSubmit' });
    assert.equal(good.status, 200); assert.equal(await good.text(), '');
    const view = hub.view(); assert.equal(view.state, 'running'); assert.equal(view.connected, true); assert.equal(view.source.title, 'project');
  } finally { hub.stop(); t.cleanup(); }
});

test('in-flight earlier beta callbacks retain token authentication', async () => {
  const t = temp();
  const { previous } = require('../orix-compat.cjs');
  const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile });
  try {
    hub.install(); hub.start();
    await new Promise(resolve => setTimeout(resolve, 100));
    const token = fs.readFileSync(path.join(t.dir, 'claude-code-hook-token'), 'utf8');
    const post = (suffix, credential, body) => fetch(`http://127.0.0.1:${PORT}/${previous}-${suffix}`, { method: 'POST', headers: { ['x-' + previous + '-token']: credential, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const invalid = await post('hook', 'wrong', { session_id: 'previous', hook_event_name: 'UserPromptSubmit' });
    assert.equal(invalid.status, 403);
    const event = await post('hook', token, { session_id: 'previous', hook_event_name: 'UserPromptSubmit' });
    assert.equal(event.status, 200);
    assert.equal(hub.view().state, 'running');
    const usage = await post('status', token, { session_id: 'previous', context: 25 });
    assert.equal(usage.status, 200);
  } finally { hub.stop(); t.cleanup(); }
});

test('Claude and Codex hook round trips preserve unrelated empty groups and metadata', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), codexFile = path.join(codexHome, 'hooks.json');
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.mkdirSync(codexHome);
    const original = { hooks: { Stop: [{ matcher: 'custom-empty', hooks: [] }, { matcher: 'custom-metadata', metadata: { keep: true } }, { hooks: [{ type: 'command', command: 'echo custom' }] }] }, other: { keep: true } };
    fs.writeFileSync(t.settingsFile, JSON.stringify(original)); fs.writeFileSync(codexFile, JSON.stringify(original));
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome });
    hub.install(); hub.uninstall(); assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')), original);
    hub.installCodex(); hub.uninstallCodex(); assert.deepEqual(JSON.parse(fs.readFileSync(codexFile, 'utf8')), original);
  } finally { t.cleanup(); }
});

test('uninstall removes ORIX hooks without discarding other hooks in the same group', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), codexFile = path.join(codexHome, 'hooks.json');
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.mkdirSync(codexHome);
    fs.writeFileSync(t.settingsFile, '{}'); fs.writeFileSync(codexFile, '{}');
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome }); hub.install(); hub.installCodex();
    const custom = { type: 'command', command: 'echo custom' };
    for (const file of [t.settingsFile, codexFile]) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8')); const group = data.hooks.Stop[0]; group.matcher = 'preserve-me'; group.hooks.push(custom); fs.writeFileSync(file, JSON.stringify(data));
    }
    hub.uninstall(); hub.uninstallCodex();
    for (const file of [t.settingsFile, codexFile]) assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).hooks.Stop, [{ matcher: 'preserve-me', hooks: [custom] }]);
  } finally { t.cleanup(); }
});

test('Claude and Codex round trips preserve unrelated empty event lists', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), codexFile = path.join(codexHome, 'hooks.json');
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.mkdirSync(codexHome);
    const original = { hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo custom' }] }], CustomEvent: [] }, other: { keep: true } };
    fs.writeFileSync(t.settingsFile, JSON.stringify(original)); fs.writeFileSync(codexFile, JSON.stringify(original));
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome });
    hub.install(); hub.uninstall(); assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')), original);
    hub.installCodex(); hub.uninstallCodex(); assert.deepEqual(JSON.parse(fs.readFileSync(codexFile, 'utf8')), original);
  } finally { t.cleanup(); }
});

test('hook round trips restore initially empty ORIX event lists across reinstall and restart', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), codexFile = path.join(codexHome, 'hooks.json');
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.mkdirSync(codexHome);
    const original = { hooks: { Stop: [], UserPromptSubmit: [], CustomEvent: [] }, other: { keep: true } };
    fs.writeFileSync(t.settingsFile, JSON.stringify(original)); fs.writeFileSync(codexFile, JSON.stringify(original));
    const options = { userData: t.dir, settingsFile: t.settingsFile, codexHome }, hub = createHub(options);
    hub.install(); hub.install(); hub.installCodex(); hub.installCodex();
    const restarted = createHub(options); restarted.uninstall(); restarted.uninstallCodex();
    assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')), original);
    assert.deepEqual(JSON.parse(fs.readFileSync(codexFile, 'utf8')), original);
  } finally { t.cleanup(); }
});

test('hook round trips preserve an explicitly empty hooks object', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), codexFile = path.join(codexHome, 'hooks.json');
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.mkdirSync(codexHome); const original = { hooks: {}, other: true };
    fs.writeFileSync(t.settingsFile, JSON.stringify(original)); fs.writeFileSync(codexFile, JSON.stringify(original));
    const options = { userData: t.dir, settingsFile: t.settingsFile, codexHome }, hub = createHub(options);
    hub.install(); hub.installCodex(); const restarted = createHub(options); restarted.uninstall(); restarted.uninstallCodex();
    assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')), original); assert.deepEqual(JSON.parse(fs.readFileSync(codexFile, 'utf8')), original);
  } finally { t.cleanup(); }
});

test('hook origin metadata failure leaves both agent configurations unchanged', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), codexFile = path.join(codexHome, 'hooks.json');
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.mkdirSync(codexHome); fs.writeFileSync(t.settingsFile, '{"hooks":{"Stop":[]}}'); fs.writeFileSync(codexFile, '{"hooks":{"Stop":[]}}');
    const options = { userData: t.dir, settingsFile: t.settingsFile, codexHome }, hub = createHub(options); hub.install(); hub.installCodex();
    for (const agent of ['claude', 'codex']) fs.writeFileSync(path.join(t.dir, `orix-${agent}-hook-origin.json`), '{ invalid');
    const beforeClaude = fs.readFileSync(t.settingsFile), beforeCodex = fs.readFileSync(codexFile);
    assert.throws(() => hub.uninstall(), /preservation data/); assert.throws(() => hub.uninstallCodex(), /preservation data/);
    assert.ok(beforeClaude.equals(fs.readFileSync(t.settingsFile))); assert.ok(beforeCodex.equals(fs.readFileSync(codexFile)));
  } finally { t.cleanup(); }
});

test('hook origin restoration never overwrites hooks added by another app', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), codexFile = path.join(codexHome, 'hooks.json');
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.mkdirSync(codexHome); fs.writeFileSync(t.settingsFile, '{"hooks":{"Stop":[]}}'); fs.writeFileSync(codexFile, '{"hooks":{"Stop":[]}}');
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile, codexHome }); hub.install(); hub.installCodex(); const other = { hooks: [{ type: 'command', command: 'echo synthetic' }] };
    for (const file of [t.settingsFile, codexFile]) { const data = JSON.parse(fs.readFileSync(file, 'utf8')); data.hooks.Stop.push(other); fs.writeFileSync(file, JSON.stringify(data)); }
    hub.uninstall(); hub.uninstallCodex();
    for (const file of [t.settingsFile, codexFile]) assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).hooks.Stop, [other]);
  } finally { t.cleanup(); }
});

test('hook install leaves configuration intact if preservation data cannot be written', () => {
  const t = temp(), codexHome = path.join(t.dir, 'codex'), codexFile = path.join(codexHome, 'hooks.json'), unusable = path.join(t.dir, 'not-a-folder');
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.mkdirSync(codexHome); fs.writeFileSync(unusable, 'fixture');
    const original = '{"hooks":{"Stop":[]}}'; fs.writeFileSync(t.settingsFile, original); fs.writeFileSync(codexFile, original);
    const hub = createHub({ userData: unusable, settingsFile: t.settingsFile, codexHome: codexHome });
    assert.throws(() => hub.install()); assert.throws(() => hub.installCodex()); assert.equal(fs.readFileSync(t.settingsFile, 'utf8'), original); assert.equal(fs.readFileSync(codexFile, 'utf8'), original);
  } finally { t.cleanup(); }
});

test('Claude hook removal restores an explicitly empty status line', () => {
  for (const originalValue of [null, false, '', 0]) {
    const t = temp();
    try {
      fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); const original = { statusLine: originalValue, other: true }; fs.writeFileSync(t.settingsFile, JSON.stringify(original));
      const options = { userData: t.dir, settingsFile: t.settingsFile }; createHub(options).install(); createHub(options).uninstall();
      assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')), original);
    } finally { t.cleanup(); }
  }
});

test('Claude hook removal preserves a status line changed while connected', () => {
  const t = temp();
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.writeFileSync(t.settingsFile, '{"statusLine":null}');
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile }); hub.install();
    const config = JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')); config.statusLine = { type: 'command', command: 'echo synthetic' }; fs.writeFileSync(t.settingsFile, JSON.stringify(config));
    hub.uninstall(); assert.deepEqual(JSON.parse(fs.readFileSync(t.settingsFile, 'utf8')).statusLine, config.statusLine);
  } finally { t.cleanup(); }
});

test('invalid status line preservation data leaves Claude settings unchanged', () => {
  const t = temp();
  try {
    fs.mkdirSync(path.dirname(t.settingsFile), { recursive: true }); fs.writeFileSync(t.settingsFile, '{"statusLine":null}');
    const hub = createHub({ userData: t.dir, settingsFile: t.settingsFile }); hub.install();
    const file = path.join(t.dir, 'orix-claude-hook-origin.json'), origin = JSON.parse(fs.readFileSync(file, 'utf8')); origin.emptyStatusLine = {}; fs.writeFileSync(file, JSON.stringify(origin));
    const before = fs.readFileSync(t.settingsFile); assert.throws(() => hub.uninstall(), /preservation data/); assert.ok(before.equals(fs.readFileSync(t.settingsFile)));
  } finally { t.cleanup(); }
});
