const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
test('explicit keyboard or dashboard opening stays accessible without hovering, normal hover still collapses', () => {
  const source = fs.readFileSync(require.resolve('../mascot.html'), 'utf8');
  const script = source.slice(source.indexOf('function updateHover('), source.indexOf('function isTyping()'));
  let collapsed = 0;
  const state = { window: { __orixKeepOpen: true }, introFinished: true, currentView: 'focus', mode: 'expanded',
    pointer: { known: false }, islandBounds: {}, inside: () => false, isTyping: () => false, leaveStartedAt: 0,
    UI: { HOME_LEAVE_DELAY: 100, VIEW_LEAVE_DELAY: 100 }, collapseIdle: () => collapsed++, setMode() {} };
  vm.runInNewContext(script, state); state.updateHover(1000); assert.equal(collapsed, 0);
  state.window.__orixKeepOpen = false; state.leaveStartedAt = 0; state.updateHover(1000); assert.equal(collapsed, 1);
});

test('an explicit tool shortcut expands even when leaving the project view', () => {
  const source = fs.readFileSync(require.resolve('../tools-ui.js'), 'utf8');
  const start = source.indexOf('api.onShortcut?.('), end = source.indexOf("addEventListener('keydown'", start);
  let callback; const state = { mode: 'expanded', currentView: 'project', window: {},
    api: { onShortcut: fn => { callback = fn; } }, setMode: next => { state.mode = next; },
    setView: next => { state.currentView = next; state.mode = 'compact'; } };
  vm.runInNewContext(source.slice(start, end), state); callback('focus');
  assert.equal(state.currentView, 'focus'); assert.equal(state.mode, 'expanded');
  assert.equal(state.window.__orixKeepOpen, true);
});

test('the Claude shortcut opens the monitor and keeps it open without hover', () => {
  const tools = fs.readFileSync(require.resolve('../tools-ui.js'), 'utf8');
  const start = tools.indexOf('api.onShortcut?.('), end = tools.indexOf("addEventListener('keydown'", start);
  const mascot = fs.readFileSync(require.resolve('../mascot.html'), 'utf8');
  const hover = mascot.slice(mascot.indexOf('function updateHover('), mascot.indexOf('function isTyping()'));
  let callback, opened, collapsed = 0;
  const state = { window: { __twocodeMonitor: { open: provider => { opened = provider; } } },
    api: { onShortcut: fn => { callback = fn; } }, introFinished: true, currentView: 'monitor', mode: 'expanded',
    pointer: { known: false }, islandBounds: {}, inside: () => false, isTyping: () => false, leaveStartedAt: 0,
    UI: { HOME_LEAVE_DELAY: 100, VIEW_LEAVE_DELAY: 100 }, collapseIdle: () => collapsed++, setMode() {} };
  vm.runInNewContext(tools.slice(start, end) + hover, state);
  callback('claude'); state.updateHover(1000);
  assert.equal(opened, 'claudecode'); assert.equal(collapsed, 0);
});

test('the AI monitor hover override honors explicit keep-open and still collapses normally', () => {
  const source = fs.readFileSync(require.resolve('../ai-monitor-ui.js'), 'utf8');
  const start = source.indexOf('  updateHover = function (now) {');
  const end = source.indexOf('  // ---- Home:', start);
  assert.ok(start >= 0 && end > start);
  for (const view of ['monitor', 'assistant']) {
    let collapsed = 0;
    const context = { updateHover() {}, currentView: view, mode: 'expanded', window: { __orixKeepOpen: true },
      document: { hasFocus: () => false }, root: { contains: () => false }, pending: false,
      pointer: { known: false }, islandBounds: {}, inside: () => false, UI: { MONITOR_LEAVE_DELAY: 900 },
      leaveStartedAt: 1, small: () => collapsed++ };
    vm.runInNewContext(source.slice(start, end), context);
    context.updateHover(1001); assert.equal(collapsed, 0);
    context.window.__orixKeepOpen = false; context.leaveStartedAt = 1;
    context.updateHover(1001); assert.equal(collapsed, 1);
  }
});

test('Escape from the AI monitor releases explicit keep-open', () => {
  const source = fs.readFileSync(require.resolve('../ai-monitor-ui.js'), 'utf8');
  const end = source.indexOf('  api.onAiMonitorState(update);');
  const start = source.lastIndexOf("  window.addEventListener('keydown'", end);
  assert.ok(start >= 0 && end > start);
  let handler, closed = 0;
  const context = { window: { __orixKeepOpen: true, addEventListener: (_event, fn) => { handler = fn; } },
    currentView: 'monitor', small: () => closed++ };
  vm.runInNewContext(source.slice(start, end), context);
  handler({ key: 'Escape', preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(closed, 1); assert.equal(context.window.__orixKeepOpen, false);
});


test('AI settings shortcut opens the existing provider panel', () => {
  const source = fs.readFileSync(require.resolve('../tools-ui.js'), 'utf8');
  const start = source.indexOf('api.onShortcut?.('), end = source.indexOf("addEventListener('keydown'", start);
  let callback, dispatched, opened = 0;
  const state = { window: { dispatchEvent: e => { dispatched = e.type; }, __twocodeOpenInlineSettings: () => opened++ }, CustomEvent: class { constructor(type) { this.type = type; } }, api: { onShortcut: fn => { callback = fn; } }, setView() {}, setMode() {} };
  vm.runInNewContext(source.slice(start, end), state); callback('ai-settings');
  assert.equal(dispatched, 'twocode:open-ai-settings'); assert.equal(opened, 1); assert.equal(state.window.__orixKeepOpen, true);
});
