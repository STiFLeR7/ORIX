const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
test('reduced-motion island transition snaps to its target without unstable spring values', () => {
  const source = fs.readFileSync(require.resolve('../mascot.html'), 'utf8');
  const start = source.indexOf('const islandSpring =');
  const end = source.indexOf('// DRAW HELPERS', start);
  const context = { visual: { width: 520, height: 236, radius: 20 },
    transition: { to: { width: 120, height: 28, radius: 14 }, duration: 1, growing: false } };
  vm.runInNewContext(source.slice(start, end) + '\nglobalThis.step = updateTransition;', context);
  context.step(100);
  assert.deepEqual(JSON.parse(JSON.stringify(context.visual)), { width: 120, height: 28, radius: 14 });
  assert.equal(context.transition, null);
});
test('shared layer branding caches local images and keyboard activation works without hover', () => {
  const events = {}, actions = [], sources = [], buttons = [];
  const context = { currentView: 'focus', window: { ORIXIcons: require('../orix-icons-ui.js'), __twocodePrefs: () => ({ lang: 'nl' }) },
    document: { documentElement: { dataset: { theme: 'light' } }, body: { appendChild: b => buttons.push(b) },
      createElement: () => ({ addEventListener: (type, fn) => { events['button:' + type] = fn; } }) },
    addEventListener: (type, fn) => { events[type] = fn; }, setView: view => actions.push(view), sendInteractive: value => actions.push(value),
    Image: class { complete = true; naturalWidth = 24; set src(value) { sources.push(value); this.source = value; } } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../orix-layer-ui.js'), 'utf8'), context);
  const calls = [], ctx = { save: () => calls.push('save'), restore: () => calls.push('restore'), drawImage: image => calls.push(image.source) };
  context.window.__orixDrawBrand('codex', ctx, 20, 30); context.window.__orixDrawBrand('codex', ctx, 20, 30);
  assert.deepEqual(sources, ['assets/icons/brands/codex_light.svg']);
  assert.equal(context.window.__orixDrawBrand('unknown', ctx, 0, 0), false);
  assert.deepEqual(calls.slice(0, 3), ['save', 'assets/icons/brands/codex_light.svg', 'restore']);
  assert.match(buttons[0].textContent, /Open ORIX/); events['button:click']();
  assert.equal(context.window.__orixKeepOpen, true); assert.deepEqual(actions, ['home', true]);
});
test('context reduced motion snaps to the pointer and finishes return without an arc', () => {
  const source = fs.readFileSync(require.resolve('../buddy.html'), 'utf8');
  const start = source.indexOf('function frame(now)');
  const script = source.slice(start, source.indexOf('// The frame:', start));
  let arrived = 0;
  const state = { window: { __orixReducedMotion: true, buddy: { arrived: () => arrived++ } }, requestAnimationFrame() {},
    P: { x: 0, y: 0 }, V: { x: 0, y: 0 }, aim: { x: 100, y: 90 }, mode: 'carry', scale: 1, alpha: 1, squashAt: -1, flight: null,
    robo: { style: {} }, $: () => ({ style: {} }), clamp: (v, min, max) => Math.max(min, Math.min(max, v)) };
  vm.runInNewContext(script, state); state.frame(100);
  assert.equal(state.P.x, 100); assert.equal(state.P.y, 90); assert.match(state.robo.style.transform, /rotate\(0deg\)/);
  state.flight = { start: 99, from: { x: 100, y: 90 }, to: { x: 5, y: 0 } }; state.frame(100);
  assert.equal(arrived, 1); assert.equal(state.P.x, 5);
});

test('saved reduced motion skips canvas page transitions and live widget drift', () => {
  const pages = fs.readFileSync(require.resolve('../pages-ui.js'), 'utf8');
  const script = pages.slice(pages.indexOf('drawExpanded = function (alpha)'), pages.indexOf('// Shared look'));
  let paints = 0, transforms = 0;
  const context = { window: { __orixResolvedAppearance: () => ({ reducedMotion: true }) },
    opening: false, changedAt: 0, performance: { now: () => 30 }, baseExpanded: () => paints++, drawHeader() {},
    slideDir: 1, calm: { matches: false }, ctx: { globalAlpha: 1, save() {}, restore() {}, translate() { transforms++; } } };
  vm.runInNewContext(script, context); context.drawExpanded(1);
  assert.equal(paints, 1); assert.equal(transforms, 0);
  const monitor = fs.readFileSync(require.resolve('../ai-monitor-ui.js'), 'utf8');
  let drift = 0;
  const gradient = { addColorStop() {} };
  const widget = { ...context, pointer: {}, inside: () => false, alpha: () => '#000', hit: {},
    ctx: { save() {}, restore() {}, beginPath() {}, roundRect() {}, fill() {}, clip() {}, fillRect() {}, stroke() {},
      createLinearGradient: () => gradient, createRadialGradient: () => { drift++; return gradient; } } };
  vm.runInNewContext(monitor.slice(monitor.indexOf('function widget('), monitor.indexOf('function ring(')), widget);
  widget.widget(0, 0, 100, 'focus', '#00c48a', true);
  assert.equal(drift, 0);
  widget.window.__orixResolvedAppearance = () => ({ reducedMotion: false });
  widget.widget(0, 0, 100, 'focus', '#00c48a', true); assert.equal(drift, 1);
});
