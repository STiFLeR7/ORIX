// Settings are their own app now (settings-app.html, opened by settings-app-main.cjs). The settings code
// itself stays here in the island, where ORIX and all his preferences live: the app asks for a list
// ("general" or "karakter") and every click in the app is played on a hidden copy of that list here.
//
// Everything you change in the app is a draft first: the app's own ORIX shows it right away, the real ORIX
// and the island only get it when you press Save (and nothing at all when you press Cancel).
(() => {
  const openView = setView;
  window.__orixOpenInlineSettings = () => { openView('settings'); setMode('expanded'); };
  // The gear, the Settings tile and the AI shortcut all open the app instead of the small settings page.
  // An app from a pack you don't have yet opens Instellingen → Apps instead, where you can get it (once per few seconds:
  // dragging a file over the island asks for the Tray again and again).
  const PACK_VIEWS = ['focus', 'tray', 'clips', 'note', 'spotify'];
  let askedAt = 0;
  setView = (view, ...rest) => {
    if (view === 'settings' && window.orix?.settingsOpen) { window.orix.settingsOpen(); return; }
    if (PACK_VIEWS.includes(view) && license.locked.includes(view)) {
      if (performance.now() - askedAt > 4000) { askedAt = performance.now(); window.orix?.settingsOpen?.('apps'); }
      return;
    }
    return openView(view, ...rest);
  };

  const root = document.getElementById('orix-settings-v2');
  const box = document.createElement('div');
  box.id = 'tc-remote-settings'; box.hidden = true; box.setAttribute('aria-hidden', 'true');
  root.appendChild(box); // inside the settings root, so its click handler runs for clicks in here

  // ---------- apps you removed (ai-monitor-ui.js leaves them out of the island, buddy-ui.js for ORIX) ----------
  let offCache = null, allOff = null; // read once, the island asks every frame
  const appsOff = () => {
    if (!offCache) {
      try {
        const saved = localStorage.getItem('orix:apps-off');
        const list = saved === null ? [] : JSON.parse(saved);
        if (!Array.isArray(list) || list.some(id => typeof id !== 'string')) throw new Error('Invalid module settings');
        offCache = new Set(list);
      } catch { offCache = new Set(['clips']); }
    }
    return offCache;
  };
  // ---------- free built-in tools (compatibility license IPC) ----------
  let license = { apps: ['focus', 'tray', 'clips', 'note', 'spotify', 'outfits'], locked: [] }; // all built-in tools are permanently free
  window.__orixLicense = () => license;
  const setLicense = v => { if (v && Array.isArray(v.locked)) { license = v; allOff = null; } };
  window.orix?.licenseGet?.().then(setLicense).catch(() => {});
  window.orix?.onLicense?.(setLicense);
  // what the island leaves out: the apps you removed, plus the ones still locked
  window.__orixAppsOff = () => (allOff ??= new Set([...appsOff(), ...license.locked]));
  const setClipboardEnabled = async enabled => {
    if (!window.orix?.clipsSetEnabled) return;
    const result = await window.orix.clipsSetEnabled(enabled);
    if (!result?.ok) throw new Error('Could not change clipboard collection. Try again.');
  };
  const clipboardInit = setClipboardEnabled(!appsOff().has('clips')).catch(() => {});

  // ---------- the draft ----------
  // prefs: a copy of ORIX's preferences; sleep/login: the two switches that live outside prefs;
  // extras: city and calendar link typed but not saved; apps: the apps you want in your ORIX.
  let draft = null;
  const realLogin = () => box.querySelector('[data-login]')?.classList.contains('on') ?? false;
  function begin() {
    if (draft) return draft;
    box.innerHTML = window.__orixSettingsHtml?.('general') || '';
    // login: null until you flip it (its real value arrives a moment after start, so it is read when needed)
    draft = { prefs: window.__orixRealPrefs(), sleep: !!sleepEnabled, login: null, extras: {}, apps: [...appsOff()] };
    draft.basePrefs = { ...draft.prefs };
    window.__orixPreviewPrefs(draft.prefs);
    return draft;
  }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function dirty() {
    if (!draft) return false;
    box.innerHTML = window.__orixSettingsHtml?.('general') || '';
    return !same(draft.prefs, draft.basePrefs) || draft.sleep !== !!sleepEnabled || (draft.login !== null && draft.login !== realLogin())
      || Object.keys(draft.extras).length > 0 || !same([...draft.apps].sort(), [...appsOff()].sort());
  }

  const settle = () => new Promise(r => setTimeout(r, 0)); // the English translation (i18n-ui.js) runs right after a change
  // A list as it looks with your draft.
  async function list(which) {
    const d = begin();
    box.innerHTML = window.__orixWithDraft(d.prefs, () => window.__orixSettingsHtml?.(which) || '');
    const set = (sel, on) => box.querySelectorAll(sel).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    set('[data-action="sleep"]', d.sleep);
    if (d.login !== null) set('[data-login]', d.login);
    for (const [key, value] of Object.entries(d.extras)) box.querySelectorAll('#tc-in-' + key).forEach(i => i.setAttribute('value', value));
    await settle();
    window.__orixTranslateTree?.(box, d.prefs.lang);
    return box.innerHTML;
  }
  const info = () => {
    const d = draft, base = window.__orixLocker?.() || {};
    const real = window.__orixRealPrefs(), current = d?.prefs || real;
    return { ...base, name: (d?.prefs.name || '').trim() || base.name, lang: 'en', dirty: dirty(),
      appearance: window.ORIXAppearance.normalize(current), committedAppearance: window.ORIXAppearance.normalize(real),
      statusColors: { busy: current.lightBusy, done: current.lightDone, error: current.lightError } };
  };

  // Play one click from the app on the draft.
  function clickDraft(el, values) {
    const d = begin();
    // what you typed in the app goes into the field here first
    for (const [id, value] of Object.entries(values || {})) {
      if (!/^tc-in-[\w-]+$/.test(id)) continue;
      document.querySelectorAll('#' + id).forEach(input => { input.value = String(value).slice(0, 2000); }); // every copy (the island may have one too)
    }
    if (el.dataset.action === 'sleep') { d.sleep = !d.sleep; return; }
    if (el.dataset.login) { d.login = !(d.login ?? el.classList.contains('on')); return; }
    if (el.dataset.save) { const key = el.dataset.pref; d.extras[key] = box.querySelector('#tc-in-' + key)?.value || ''; return; }
    // these really happen right now: quit, restart and the test buttons (they test the island itself)
    if (el.dataset.quit || el.dataset.restart || el.dataset.test) { el.click(); return; }
    window.__orixWithDraft(d.prefs, () => el.click());
    window.__orixPreviewPrefs(d.prefs);
  }

  // Save: everything in the draft becomes real at once.
  async function saveDraft() {
    if (!draft) return;
    const d = draft;
    const changes = Object.fromEntries(Object.entries(d.prefs).filter(([key, value]) => !same(value, d.basePrefs[key])));
    window.__orixSaveDraft({ ...window.__orixRealPrefs(), ...changes });
    if (Object.keys(d.extras).length || d.login !== null) await window.__orixSaveSettingsServices(d.extras, d.login);
    await clipboardInit;
    if (d.apps.includes('clips')) await setClipboardEnabled(false);
    try { localStorage.setItem('orix:apps-off', JSON.stringify(d.apps)); }
    catch { throw new Error('Could not save module settings. Try again.'); }
    if (!d.apps.includes('clips')) {
      try { await setClipboardEnabled(true); }
      catch (error) {
        try { await setClipboardEnabled(false); } catch {}
        try { localStorage.setItem('orix:apps-off', JSON.stringify([...appsOff()])); }
        catch { throw new Error('Could not restore module settings after a clipboard error. Check the Clipboard switch before restarting.'); }
        throw error;
      }
    }
    box.innerHTML = window.__orixSettingsHtml?.('karakter') || '';
    if (d.sleep !== !!sleepEnabled) box.querySelector('[data-action="sleep"]')?.click();
    offCache = new Set(d.apps); allOff = null;
    draft = null;
    window.__orixPreviewPrefs(null);
  }

  // req: { kind: 'list' | 'click' | 'save' | 'discard' | 'apps' | 'app', ... }
  window.__orixRemoteSettings = async req => {
    if (req?.kind === 'appearance-init') {
      if (!draft) window.__orixInitAppearance?.(req.values?.legacyTheme);
      return { info: info() };
    }
    if (req?.kind === 'appearance') {
      const options = { themeMode: ['light', 'dark', 'system'], motionMode: ['full', 'reduced', 'system'], lang: ['en'] };
      if (!req.values || typeof req.values !== 'object' || Array.isArray(req.values)
        || Object.entries(req.values).some(([key, value]) => !options[key]?.includes(value))) return { ok: false, error: 'Invalid appearance settings.' };
      Object.assign(begin().prefs, req.values);
      window.__orixPreviewPrefs(draft.prefs);
      return { info: info() };
    }
    const which = req?.which === 'karakter' ? 'karakter' : 'general';
    if (req?.kind === 'save') await saveDraft();
    if (req?.kind === 'discard') { draft = null; window.__orixPreviewPrefs(null); return { info: info() }; }
    if (req?.kind === 'apps' || req?.kind === 'app') {
      const d = begin();
      if (req.kind === 'app' && /^[a-z]+$/.test(req.id || '')) {
        const off = new Set(d.apps); if (req.on) off.delete(req.id); else off.add(req.id);
        d.apps = [...off];
      }
      return { off: d.apps, locked: license.locked, info: info() };
    }
    if (req?.kind === 'click') {
      await list(which);
      const el = req.row != null ? box.querySelectorAll('.tc-setting-row')[req.row] : box.querySelectorAll('button')[req.index];
      if (el && req.row != null) window.__orixWithDraft(begin().prefs, () => window.__orixDemo?.(el.dataset.demo)); // an example block: the app's ORIX shows it
      else if (el) clickDraft(el, req.values);
      await new Promise(r => setTimeout(r, 30));
    }
    return { html: await list(which), info: info() };
  };

  // While the app is open its ORIX is drawn too (buddy-ui.js), from the draft.
  window.__orixFaceForSettings = false;
  window.__orixSettingsClosed = () => { draft = null; window.__orixPreviewPrefs(null); };
})();
