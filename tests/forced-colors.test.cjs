'use strict';
const fs = require('node:fs');
const path = require('node:path');
if (process.versions.electron) {
  const { app, BrowserWindow } = require('electron');
  const root = path.join(__dirname, '..');
  app.setPath('userData', process.env.ORIX_TEST_USER_DATA);
  app.whenReady().then(async () => {
    const html = fs.readFileSync(path.join(root, 'settings-app.html'), 'utf8');
    const inline = html.match(/<style>([\s\S]*?)<\/style>/)[1];
    const css = inline + '\n' + fs.readFileSync(path.join(root, 'orix-theme.css'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'orix-dashboard.css'), 'utf8');
    const win = new BrowserWindow({ width: 820, height: 560, show: false, webPreferences: { backgroundThrottling: false } });
    await win.loadURL('data:text/html,' + encodeURIComponent('<!doctype html><style>' + css + '</style><div class="tool-row"><button class="btn ghost" data-tool="note">Open</button></div><div class="appearance-options"><button class="selected">System</button><button>Full</button></div><button class="tc-chip on">Classic</button><button class="tc-swatch on" style="background:#ff9a1f"></button>'));
    win.webContents.debugger.attach('1.3');
    await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] });
    const result = await win.webContents.executeJavaScript(`(() => { const s = getComputedStyle(document.querySelector('[data-tool]')), selected = getComputedStyle(document.querySelector('.appearance-options .selected')), other = getComputedStyle(document.querySelector('.appearance-options button:not(.selected)')), preset = getComputedStyle(document.querySelector('.tc-chip.on')), swatch = getComputedStyle(document.querySelector('.tc-swatch.on')); return { forced: matchMedia('(forced-colors: active)').matches, width: parseFloat(s.borderTopWidth), style: s.borderTopStyle, color: s.borderTopColor, background: getComputedStyle(document.body).backgroundColor, selectedBorder: selected.borderTopWidth, otherBorder: other.borderTopWidth, presetColor: preset.color, presetBackground: preset.backgroundColor, swatchOutline: parseFloat(swatch.outlineWidth), swatchStyle: swatch.outlineStyle, swatchOffset: parseFloat(swatch.outlineOffset) }; })()`);
    if (!result.forced || result.width <= 0 || result.style === 'none' || result.color === result.background) throw new Error('Tool button border is not visible: ' + JSON.stringify(result));
    if (parseFloat(result.selectedBorder) <= parseFloat(result.otherBorder)) throw new Error('Selected appearance option is not distinguished: ' + JSON.stringify(result));
    if (result.presetColor === result.presetBackground) throw new Error('Selected preset label is not visible: ' + JSON.stringify(result));
    if (result.swatchOutline <= 0 || result.swatchStyle === 'none') throw new Error('Selected swatch is not distinguished: ' + JSON.stringify(result));
    await win.webContents.debugger.sendCommand('DOM.enable');
    await win.webContents.debugger.sendCommand('CSS.enable');
    const { root: dom } = await win.webContents.debugger.sendCommand('DOM.getDocument');
    const { nodeId } = await win.webContents.debugger.sendCommand('DOM.querySelector', { nodeId: dom.nodeId, selector: '.tc-swatch.on' });
    await win.webContents.debugger.sendCommand('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['focus-visible'] });
    const focus = await win.webContents.executeJavaScript(`(() => { const s = getComputedStyle(document.querySelector('.tc-swatch.on')); return { width: parseFloat(s.outlineWidth), offset: parseFloat(s.outlineOffset) }; })()`);
    if (focus.width === result.swatchOutline && focus.offset === result.swatchOffset) throw new Error('Focus is not distinguishable from selection: ' + JSON.stringify(focus));
    const paintSource = html.slice(html.indexOf('function paint(html, fresh)'), html.indexOf('const typing ='));
    const retained = await win.webContents.executeJavaScript(`(() => {
      const list = document.createElement('div'), scroll = document.createElement('div');
      document.body.append(scroll); scroll.append(list);
      let lastHtml = '', lastFace = '', freshTimer;
      const requestAnimationFrame = () => {}, drawPreviews = () => {}, filter = () => {};
      ${paintSource}
      const markup = '<button data-pref="lightBusy" data-value="#ffb000">Color</button>';
      list.innerHTML = markup; list.firstElementChild.focus();
      paint(markup + '<span>Updated</span>', false);
      const swatch = document.activeElement === list.firstElementChild;
      list.innerHTML = '<button data-app="focus" data-on="0">Focus</button>'; list.firstElementChild.focus();
      paint('<button data-app="focus" data-on="1">Focus</button>', false);
      const module = document.activeElement === list.firstElementChild;
      list.innerHTML = '<button data-cx="codex" aria-disabled="true">Codex</button>'; list.firstElementChild.focus();
      paint('<button data-cx="codex" aria-pressed="true">Codex</button>', false);
      return { swatch, module, connection: document.activeElement === list.firstElementChild };
    })()`);
    if (!retained.swatch || !retained.module || !retained.connection) throw new Error('Settings control focus was lost during redraw: ' + JSON.stringify(retained));
    // Start at the tested size so an asynchronous native resize cannot invalidate the scroll position.
    await win.webContents.executeJavaScript(`document.body.innerHTML = '<div class="app"><aside></aside><main><div class="scroll" id="scroll"><div style="height:1000px"></div><button id="last" style="display:block;margin-left:auto">Quit</button></div><div class="savebar on" id="savebar"><span>Not saved yet</span><button>Cancel</button><button>Save</button></div></main></div>';`);
    await new Promise(resolve => setTimeout(resolve, 600));
    const positions = await win.webContents.executeJavaScript(`(() => { const scroll = document.querySelector('#scroll'); scroll.scrollTop = scroll.scrollHeight; const last = document.querySelector('#last').getBoundingClientRect(), bar = document.querySelector('#savebar').getBoundingClientRect(); return { lastBottom: last.bottom, barTop: bar.top, remainingScroll: scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop }; })()`);
    if (Math.abs(positions.remainingScroll) > 1) throw new Error('Layout fixture did not reach the scroll end: ' + JSON.stringify(positions));
    if (positions.lastBottom > positions.barTop) throw new Error('Save bar covers the last settings control: ' + JSON.stringify(positions));
    app.exit(0);
  }).catch(error => { console.error(error.stack); app.exit(1); });
} else {
  const test = require('node:test');
  const assert = require('node:assert/strict');
  const { spawnSync } = require('node:child_process');
  test('dashboard controls retain focus and remain visible', () => {
    const env = { ...process.env };
    delete env.ELECTRON_RUN_AS_NODE;
    const tempRoot = fs.realpathSync(require('node:os').tmpdir());
    const temporary = fs.mkdtempSync(path.join(tempRoot, 'orix-forced-colors-'));
    env.ORIX_TEST_USER_DATA = temporary;
    try {
      const result = spawnSync(require('electron'), [__filename], { env, encoding: 'utf8', timeout: 30000, windowsHide: true });
      assert.equal(result.status, 0, result.stderr || result.error?.message);
    } finally {
      assert.equal(path.dirname(fs.realpathSync(temporary)), tempRoot);
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  });
}
