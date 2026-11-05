'use strict';
// Small tools in the island: clipboard history ("Klembord") and one quick note ("Notitie"),
// plus the keyboard shortcuts Ctrl+Alt+1..6. Layout comes from pages-ui.js (same as every page).
(function toolsPages() {
  const api = window.twocode;
  if (!api?.clipsGet) return;
  const root = document.createElement('section'); root.id = 'twocode-tools'; document.body.appendChild(root);
  const style = document.createElement('style'); style.textContent = `
#twocode-tools{position:absolute;z-index:60;display:none;color:#f4f7ef;font:12px/1.4 Inter, "Segoe UI",sans-serif;pointer-events:auto}
#twocode-tools *{box-sizing:border-box}
#twocode-tools{font-family:Inter,"Segoe UI",sans-serif;color:#fff}
#twocode-tools button{border:0;background:transparent;color:#fff;font:inherit;padding:0;cursor:pointer}
/* clipboard: a plain list like Settings, a small coloured icon per kind */
#twocode-tools .tl-list{height:100%;overflow:auto;scrollbar-width:none;padding:2px 2px 0}
#twocode-tools .tl-row{display:flex;align-items:center;gap:14px;width:100%;height:48px;text-align:left;border-radius:12px;padding:0 8px;margin:0 -8px;width:calc(100% + 16px)}
#twocode-tools .tl-row:hover{background:#1c1c1e}
#twocode-tools .tl-row:active{transform:scale(.99);transition:transform .1s ease-out}
#twocode-tools .tl-ic{flex:none;width:30px;height:30px;border-radius:7px;display:grid;place-items:center;background:var(--k)}
#twocode-tools .tl-txt{flex:1;min-width:0;height:48px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #2c2c2e}
#twocode-tools .tl-row:last-of-type .tl-txt{border-bottom:0}
#twocode-tools .tl-txt b{flex:1;min-width:0;font-size:15px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#twocode-tools .tl-txt b.mono{font:500 14px "Cascadia Mono",Consolas,monospace}
#twocode-tools .tl-txt small{flex:none;font-size:13px;color:#8e8e93}
#twocode-tools .tl-txt small.ok{color:#30d158;font-weight:600}
#twocode-tools .tl-clear{display:block;width:100%;height:44px;margin-top:4px;color:#ff4245;font-size:15px;text-align:left}
#twocode-tools .tl-empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center}
#twocode-tools .tl-empty b{font-size:17px;font-weight:600}
#twocode-tools .tl-empty span{font-size:13px;color:#8e8e93}
/* note: Apple Notes in the dark, right on the black: a bold first line, check circles in yellow */
#twocode-tools .tl-note-actions{display:flex;align-items:center;gap:8px;min-height:30px;font-size:11px}
#twocode-tools .tl-note-actions button{min-height:24px;padding:2px 7px;border:1px solid var(--orix-border);border-radius:6px}
#twocode-tools .tl-note-actions [data-note-status]{flex:1}
#twocode-tools .tl-paper{height:calc(100% - 30px);overflow:auto;cursor:text;scrollbar-width:none;padding:0 2px}
#twocode-tools .tl-title{font-size:22px;line-height:28px;font-weight:700;letter-spacing:-.3px;min-height:28px}
#twocode-tools .tl-date{color:#8e8e93;font-size:13px;margin:2px 0 8px}
#twocode-tools .tl-line{display:flex;align-items:center;gap:12px;min-height:34px;font-size:17px;line-height:24px}
#twocode-tools .tl-check{flex:none;width:22px;height:22px;border-radius:50%;border:1.5px solid #48484a;display:grid;place-items:center}
#twocode-tools .tl-check:hover{border-color:#fff}
#twocode-tools .tl-line.ok .tl-check{background:#fff;border-color:#fff}
#twocode-tools .tl-line.ok span{color:#8e8e93;text-decoration:line-through}
#twocode-tools .tl-dot{flex:none;width:5px;height:5px;border-radius:50%;background:#fff;margin:0 8px}
#twocode-tools .tl-hint{color:#8e8e93;font-weight:400}
#twocode-tools textarea{width:100%;height:100%;resize:none;border:0;background:transparent;color:#fff;padding:0;font:17px/34px Inter,"Segoe UI",sans-serif;outline:none;caret-color:#fff}
/* compact (notch-app size) */
#twocode-tools .tl-row{height:36px;gap:10px;border-radius:9px}
#twocode-tools .tl-ic{width:22px;height:22px;border-radius:6px}
#twocode-tools .tl-ic svg{width:13px;height:13px}
#twocode-tools .tl-txt{height:36px}
#twocode-tools .tl-txt b{font-size:13px}
#twocode-tools .tl-txt b.mono{font-size:12px}
#twocode-tools .tl-txt small{font-size:11px}
#twocode-tools .tl-clear{height:32px;font-size:12px}
#twocode-tools .tl-title{font-size:16px;line-height:20px;min-height:20px;letter-spacing:-.1px}
#twocode-tools .tl-date{font-size:11px;margin:1px 0 4px}
#twocode-tools .tl-line{min-height:26px;font-size:13px;line-height:18px;gap:9px}
#twocode-tools .tl-check{width:16px;height:16px}
#twocode-tools .tl-check svg{width:9px;height:9px}
#twocode-tools textarea{font-size:13px;line-height:26px}
#twocode-tools .tl-empty b{font-size:14px}
#twocode-tools .tl-empty span{font-size:11px}
#twocode-tools textarea::placeholder{color:#8e8e93}`;
  document.head.appendChild(style);
  const esc = s => String(s).replace(/[&<>"]/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]));

  // ---- clipboard ----
  let clips = [], copied = -1, lastRender = '';
  const loadClips = () => api.clipsGet().then(r => { if (r.ok) { clips = r.clips; render(true); } }).catch(() => {});
  api.onClips?.(r => { clips = r.clips || []; render(true); });
  // ---- note ----
  let note = null, savedNote = null, savedAt = 0, saveTimer = null, noteError = '', noteSaving = false, noteWrite = 0;
  async function loadNote() {
    try { const result = await api.noteGet(); if (!result?.ok) throw new Error(); note = result.text; savedNote = note; noteError = ''; }
    catch { noteError = 'Could not load your note. Retry before editing.'; }
    render(true);
  }
  loadNote();
  const noteStatus = () => noteError || (noteSaving ? 'Saving…' : note !== savedNote ? 'Unsaved changes' : savedAt ? 'Saved at ' + new Date(savedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Saved automatically');
  const noteActions = editing => `<div class="tl-note-actions">${editing ? '' : `<button type="button" data-edit="1" ${note === null ? 'disabled' : ''}>Edit note</button>`}<span id="note-save-status" data-note-status role="status" aria-live="polite">${esc(noteStatus())}</span><button type="button" data-note-retry ${noteError ? '' : 'hidden'}>Retry</button></div>`;
  function updateNoteStatus() {
    const status = root.querySelector('[data-note-status]'); if (status) status.textContent = noteStatus();
    const retry = root.querySelector('[data-note-retry]'); if (retry) retry.hidden = !noteError;
  }
  async function saveNote() {
    if (note === null) return false;
    const text = note, write = ++noteWrite; noteSaving = true; noteError = ''; updateNoteStatus();
    try {
      const result = await api.noteSet(text); if (!result?.ok) throw new Error();
      if (write === noteWrite) { savedNote = text; if (text === note) savedAt = Date.now(); }
      return true;
    } catch { if (write === noteWrite) noteError = 'Could not save your note. Your changes are still here. Retry.'; return false; }
    finally { if (write === noteWrite) { noteSaving = false; updateNoteStatus(); } }
  }

  window.__orixFlushNote = async () => {
    clearTimeout(saveTimer);
    if (note === null) return true;
    while (note !== savedNote || noteSaving || noteError) {
      if (!await saveNote()) return false;
    }
    return true;
  };

  function render(force) {
    const view = currentView, key = view + ':' + clips.length + ':' + copied + ':' + (note === null);
    if (!force && key === lastRender) return; lastRender = key;
    if (view === 'clips') {
      const T = (nl, en) => window.__twocodePrefs?.().lang === 'en' ? en : nl;
      const ago = at => { if (!at) return ''; const m = Math.floor((Date.now() - at) / 60000); return m < 1 ? T('nu', 'now') : m < 60 ? m + ' min' : Math.floor(m / 60) + T(' uur', ' h'); };
      const G = { link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>', text: '<path d="M5 7h14M5 12h14M5 17h9"/>', mail: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="m4 8 8 5 8-5"/>' };
      const kindOf = text => { const t = text.trim();
        if (/^#?[0-9a-f]{6}$/i.test(t) || /^rgba?\(/i.test(t)) return ['colour', ''];
        if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(t)) return ['mail', '#2c2c2e'];
        if (/^(https?:\/\/|www\.)\S+$/i.test(t) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(t)) return ['link', '#2c2c2e'];
        if (/[{};]\s*$|=>|^\s*(git|npm|npx|cd|const|let|function|import|def|class|SELECT|<\w+)\b|^\$ /m.test(t)) return ['code', '#2c2c2e'];
        return ['text', '#2c2c2e']; };
      const row = (c, i) => { const [kind, colour] = kindOf(c.text), t = c.text.trim(), hex = t.replace(/^(?=[0-9a-f]{6}$)/i, '#');
        const ic = kind === 'colour' ? `<span class="tl-ic" style="--k:${esc(hex)};box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)"></span>`
          : `<span class="tl-ic" style="--k:${colour}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${G[kind]}</svg></span>`;
        return `<button class="tl-row" data-i="${i}">${ic}<span class="tl-txt"><b class="${kind === 'code' || kind === 'colour' ? 'mono' : ''}">${esc(t.replace(/\s+/g, ' '))}</b><small class="${i === copied ? 'ok' : ''}">${i === copied ? esc(window.__twocodeTr?.('Gekopieerd ✓') ?? 'Gekopieerd ✓') : esc(ago(c.at))}</small></span></button>`; };
      root.innerHTML = clips.length
        ? `<div class="tl-list">${clips.map(row).join('')}<button class="tl-clear" data-clear="1">${T('Wis geschiedenis', 'Clear history')}</button></div>`
        : `<div class="tl-empty"><b>${T('Nog niks gekopieerd', 'Nothing copied yet')}</b><span>${T('Kopieer iets (Ctrl + C), dan staat het hier.', 'Copy something (Ctrl + C) and it shows up here.')}</span></div>`;
    } else if (view === 'note') {
      if (root.querySelector('textarea')) return; // don't rebuild while typing
      root.innerHTML = noteView();
    }
  }
  // The note as a page of Apple Notes: the first line is the title, "[ ]" / "[x]" lines get round check circles,
  // "- " lines get a dot. Click the page to type; it is saved by itself.
  function noteView() {
    const lines = String(note || '').split('\n'), title = lines[0] || '', rest = lines.slice(1);
    const body = rest.map((line, i) => {
      const box = /^\s*[-*]?\s*\[( |x|X)\]\s?(.*)$/.exec(line), dot = /^\s*[-•*]\s+(.*)$/.exec(line);
      if (box) return `<div class="tl-line${box[1] !== ' ' ? ' ok' : ''}"><button type="button" class="tl-check" data-tick="${i + 1}" role="checkbox" aria-checked="${box[1] !== ' '}" aria-label="${esc(box[2].trim() || 'Note checklist item')}">${box[1] !== ' ' ? '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#000" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>' : ''}</button><span>${esc(box[2])}</span></div>`;
      if (dot) return `<div class="tl-line"><i class="tl-dot"></i><span>${esc(dot[1])}</span></div>`;
      return line.trim() ? `<div class="tl-line"><span>${esc(line)}</span></div>` : '';
    }).join('');
    return `${noteActions(false)}<div class="tl-paper" data-edit="1"><div class="tl-title">${title ? esc(title) : '<span class="tl-hint">Click to type</span>'}</div><div class="tl-date">[ ] makes a check circle</div>${body}</div>`;
  }
  function editNote() {
    if (note === null) return;
    root.innerHTML = `${noteActions(true)}<div class="tl-paper editing"><textarea id="tl-note" aria-label="Note" aria-describedby="note-save-status" placeholder="Title, then your lines…" maxlength="20000">${esc(note || '')}</textarea></div>`;
    const area = root.querySelector('textarea');
    area.addEventListener('focus', () => { projectInputFocused = true; sendInteractive(true); });
    area.addEventListener('blur', () => { projectInputFocused = false; setTimeout(() => { if (currentView === 'note' && !root.contains(document.activeElement)) { root.innerHTML = noteView(); } }, 0); });
    area.addEventListener('input', () => { note = area.value; noteError = ''; updateNoteStatus(); clearTimeout(saveTimer); saveTimer = setTimeout(saveNote, 400); });
    area.focus(); area.setSelectionRange(area.value.length, area.value.length);
  }
  root.addEventListener('click', e => {
    if (e.target.closest('[data-note-retry]')) { clearTimeout(saveTimer); if (note === null) loadNote(); else saveNote(); return; }
    const tick = e.target.closest('[data-tick]');
    if (tick) { // tick a line off (or on again)
      const lines = String(note || '').split('\n'), i = Number(tick.dataset.tick);
      lines[i] = lines[i].replace(/\[( |x|X)\]/, m => m === '[ ]' ? '[x]' : '[ ]'); note = lines.join('\n');
      saveNote(); root.innerHTML = noteView(); sound('click'); return;
    }
    if (e.target.closest('[data-edit]')) { editNote(); return; }
    const clip = e.target.closest('[data-i]');
    if (clip) { api.clipsCopy(Number(clip.dataset.i)).then(r => { if (r.ok) { clips = r.clips; copied = 0; render(true); sound('click'); setTimeout(() => { copied = -1; render(true); }, 1400); } }); return; }
    if (e.target.closest('[data-clear]')) api.clipsClear().then(r => { if (r.ok) { clips = []; render(true); } });
  });

  // ---- placing the panel ----
  let shown = '';
  (function position() {
    const view = currentView, show = ['clips', 'note'].includes(view) && mode === 'expanded' && visual.width > 500 && visual.height > Math.min(targetHeight() - 30, 150);
    const display = show ? 'block' : 'none'; if (root.style.display !== display) root.style.display = display;
    if (show) {
      window.__twocodePage.place(root, contentRect());
      if (shown !== view) { shown = view; lastRender = ''; root.innerHTML = ''; if (view === 'clips') loadClips(); render(true); }
    } else shown = '';
    requestAnimationFrame(position);
  })();

  // ---- keyboard shortcuts (Ctrl+Alt+1..6) ----
  api.onShortcut?.(view => {
    window.__orixKeepOpen = true; // explicit openings remain usable without pointer hover
    if (view === 'claude') { window.__twocodeMonitor?.open('claudecode'); return; }
    if (view === 'ai-settings') { window.dispatchEvent(new CustomEvent('twocode:open-ai-settings')); window.__twocodeOpenInlineSettings?.(); return; }
    setView(view);
    setMode('expanded'); // leaving Project normally folds the layer; an explicit tool open must expand it
  });
  addEventListener('keydown', event => { if (event.key === 'Escape') window.__orixKeepOpen = false; }, true);
  canvas.addEventListener('click', e => {
    for (const [key, view] of [['clipsApp', 'clips'], ['noteApp', 'note']]) if (inside(e.clientX, e.clientY, hit[key])) { e.preventDefault(); e.stopImmediatePropagation(); setView(view); return; }
  }, true);
  window.__twocodeTools = { open: view => setView(view) };
})();
