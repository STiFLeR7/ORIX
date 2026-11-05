const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const luminance = color => color.slice(1).match(/../g).map(v => parseInt(v, 16) / 255)
  .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);

test('light action text has at least 4.5 contrast on its white surface', () => {
  const css = fs.readFileSync(require.resolve('../src/orix-theme.css'), 'utf8');
  const color = css.match(/data-theme=light\]\{[^}]*--orix-action:(#[a-f0-9]{6})/i)[1];
  const contrast = 1.05 / (luminance(color) + 0.05);
  assert.ok(contrast >= 4.5, `Action text contrast is ${contrast.toFixed(2)}`);
});

test('Focus picker adjacent values use readable theme colors without an opaque fade', () => {
  const source = fs.readFileSync(require.resolve('../src/focus-ui.js'), 'utf8');
  const rule = source.split('#orix-focus .fo-num{')[1]?.split('}')[0] || '';
  assert.match(rule, /color:var\(--orix-muted/);
  assert.doesNotMatch(source, /class="fo-fade"/);
  const { palette } = require('../src/orix-appearance-ui.js');
  for (const theme of ['light', 'dark']) {
    const p = palette({ theme });
    const levels = [luminance(p.muted), luminance(p.surface)].sort((a, b) => a - b);
    assert.ok((levels[1] + .05) / (levels[0] + .05) >= 4.5, `${theme} picker contrast`);
  }
});

test('Focus picker unit labels remain readable on the dark selection band', () => {
  const css = fs.readFileSync(require.resolve('../src/orix-layer.css'), 'utf8');
  const value = css.match(/#orix-focus \.fo-unit\{color:(#[a-f0-9]{6})/i)?.[1];
  assert.ok(value, 'unit label needs its own color against the dark selection band');
  const levels = [luminance(value), luminance('#1c1c1e')].sort((a, b) => a - b);
  assert.ok((levels[1] + .05) / (levels[0] + .05) >= 4.5);
  assert.match(css, /data-high-contrast=true\] #orix-focus \.fo-unit\{color:CanvasText/);
});

test('high-contrast Focus selection uses system background and text together', () => {
  const css = fs.readFileSync(require.resolve('../src/orix-layer.css'), 'utf8');
  assert.match(css, /data-high-contrast=true\] #orix-focus \.fo-band\{background:Canvas;/);
  assert.match(css, /data-high-contrast=true\] #orix-focus \.fo-num\.on\{color:CanvasText/);
});

test('AI session details use theme colors in light and high contrast modes', () => {
  const css = fs.readFileSync(require.resolve('../src/orix-layer.css'), 'utf8');
  const rules = css.split('\n').filter(line => line.includes(':is([data-theme=light],[data-high-contrast=true]) #orix-ai-monitor.cl-new'));
  for (const selector of ['.gl-tile', '.gl-big', '.gl-sub', '.gl-md', '.gl-steps', '.gl-card', '.gl-compose', '.gl-two']) {
    assert.ok(rules.some(line => line.includes(selector) && line.includes('var(--orix-')), `${selector} needs theme-aware styling`);
  }
});

test('AI working timer overrides its legacy light-colored text in light mode', () => {
  const css = fs.readFileSync(require.resolve('../src/orix-layer.css'), 'utf8');
  assert.match(css, /:is\(\[data-theme=light\],\[data-high-contrast=true\]\) #orix-ai-monitor\.cl-new \.cx-timer\{color:var\(--orix-text\)/);
});

test('AI plan and choice controls use readable theme colors', () => {
  const css = fs.readFileSync(require.resolve('../src/orix-layer.css'), 'utf8');
  const rules = css.split('\n').filter(line => line.includes(':is([data-theme=light],[data-high-contrast=true]) #orix-ai-monitor.cl-new'));
  for (const selector of ['.am-plan', '.am-said', '.am-option', '.am-note', '.am-primary']) {
    assert.ok(rules.some(line => line.includes(selector) && line.includes('var(--orix-')), `${selector} needs theme-aware styling`);
  }
});
