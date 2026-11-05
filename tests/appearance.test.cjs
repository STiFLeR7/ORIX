'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const appearance = require('../orix-appearance-ui.js');
const { normalize, resolve, apply } = appearance;
const fs = require('node:fs'), vm = require('node:vm');

test('appearance preserves saved choices while migrating Dutch to English', () => {
  assert.deepEqual(normalize({ themeMode: 'dark', motionMode: 'reduced', lang: 'nl' }, 'light', 'en-US'),
    { themeMode: 'dark', motionMode: 'reduced', lang: 'en' });
  assert.equal(normalize({ lang: 'en' }, null, 'nl-NL').lang, 'en');
});

test('first use and invalid preferences use safe locale and theme fallbacks', () => {
  assert.deepEqual(normalize(null, null, 'nl-BE'), { themeMode: 'system', motionMode: 'system', lang: 'en' });
  assert.deepEqual(normalize({ themeMode: 'wrong', motionMode: true, lang: 'fr' }, 'light', 'fr-FR'),
    { themeMode: 'light', motionMode: 'system', lang: 'en' });
  assert.equal(normalize({}, 'dark', 'NL-nl').lang, 'en');
  assert.equal(normalize([], 'wrong', '').themeMode, 'system');
});

test('system appearance updates while fixed modes keep their explicit choice', () => {
  const system = { dark: true, reducedMotion: true, highContrast: true };
  assert.deepEqual(resolve({ themeMode: 'system', motionMode: 'system' }, system),
    { theme: 'dark', reducedMotion: true, highContrast: true });
  assert.equal(resolve({ themeMode: 'light', motionMode: 'full' }, system).theme, 'light');
  assert.equal(resolve({ themeMode: 'dark', motionMode: 'reduced' }, { dark: false }).reducedMotion, true);
  assert.equal(resolve({ themeMode: 'system', motionMode: 'system' }, { dark: false }).theme, 'light');
  assert.equal(resolve({ themeMode: 'system', motionMode: 'full' }, system).reducedMotion, false);
});

test('applying resolved appearance sets accessible state without altering preferences', () => {
  const root = { dataset: {} }, state = { theme: 'light', reducedMotion: true, highContrast: false };
  apply(root, state);
  assert.deepEqual(root.dataset, { theme: 'light', reducedMotion: 'true', highContrast: 'false' });
  assert.deepEqual(state, { theme: 'light', reducedMotion: true, highContrast: false });
});

test('actual preference initialization migrates Dutch and preserves unrelated preferences', () => {
  const source = fs.readFileSync(require.resolve('../orix-fun.js'), 'utf8');
  const script = source.slice(source.indexOf('const DEFAULTS'), source.indexOf('// Old saves only')) + '\nglobalThis.snapshot = prefs;';
  const context = { window: { ORIXAppearance: { normalize } }, navigator: { language: 'en-US' },
    store: { get: () => ({ lang: 'nl', warnAt: 90 }), set() {} } };
  vm.runInNewContext(script, context);
  assert.equal(context.snapshot.lang, 'en'); assert.equal(context.snapshot.warnAt, 90);
});

test('actual preference Save does not mutate committed values when local storage fails', () => {
  const source = fs.readFileSync(require.resolve('../orix-fun.js'), 'utf8');
  const start = source.indexOf('function commitPreferences(');
  const script = source.slice(start, source.indexOf('// Draw the app', start));
  const context = { window: {}, prefs: { themeMode: 'dark' },
    localStorage: { setItem() { throw new Error('Unavailable storage'); } },
    save() { throw new Error('Unavailable storage'); }, apply() {}, jump() {}, feel() {}, chime() {} };
  vm.runInNewContext(script, context);
  assert.throws(() => context.window.__orixSaveDraft({ themeMode: 'light' }));
  assert.equal(context.prefs.themeMode, 'dark');
});
test('floating surfaces use matching readable palettes in both themes and system high contrast', () => {
  const dark = appearance.palette({ theme: 'dark' }), light = appearance.palette({ theme: 'light' });
  assert.equal(dark.surface, '#1c2024'); assert.equal(dark.text, '#f4f5f7');
  assert.equal(light.surface, '#ffffff'); assert.equal(light.text, '#171b20');
  assert.equal(appearance.palette({ theme: 'light', highContrast: true }).surface, 'Canvas');
  assert.equal(appearance.palette({ highContrast: true }).text, 'CanvasText');
});
test('Focus countdown and progress use the resolved foreground color', () => {
  const source = fs.readFileSync(require.resolve('../focus-ui.js'), 'utf8');
  for (const selector of ['.fo-big b', '.fo-bar i']) {
    const rule = source.split(`#orix-focus ${selector}{`)[1]?.split('}')[0];
    assert.match(rule || '', /(?:color|background):var\(--orix-text/);
  }
});
test('reduced-motion mark effects return a complete stable transform', () => {
  const source = fs.readFileSync(require.resolve('../orix-fun.js'), 'utf8');
  const script = source.slice(source.indexOf('function fx()'), source.indexOf('window.__orixGhostFx ='));
  const context = { window: { __orixResolvedAppearance: () => ({ reducedMotion: true }) } };
  vm.runInNewContext(script, context); const effect = context.fx();
  assert.equal(effect.dy, 0); assert.equal(effect.tilt, 0);
  for (const key of ['scale', 'sx', 'sy']) assert.equal(effect[key], 1);
});

test('status presets and color swatches expose their selection and English labels', () => {
  const source = fs.readFileSync(require.resolve('../orix-fun.js'), 'utf8');
  const script = source.slice(source.indexOf('  const preview = p =>'), source.indexOf('  const MOOD_DEMO =')) + '\nglobalThis.render = lightsBlock;';
  const prefs = { lightBusy: '#ff9a1f', lightDone: '#22e05a', lightError: '#ff3b3b' };
  const context = { prefs };
  vm.runInNewContext(script, context);
  const html = context.render();
  assert.match(html, /aria-pressed="true"[^>]*data-lightpreset="klassiek"/);
  assert.match(html, /aria-pressed="false"[^>]*data-lightpreset="zacht"/);
  assert.match(html, /aria-pressed="true"[^>]*data-pref="lightBusy"[^>]*aria-label="Working or a question: #ff9a1f"/);
  assert.match(html, /aria-pressed="false"[^>]*data-pref="lightBusy"[^>]*aria-label="Working or a question: #ffb000"/);
});
