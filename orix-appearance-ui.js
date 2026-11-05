'use strict';
((root) => {
  function normalize(input, legacyTheme, locale) {
    const saved = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const themeMode = ['light', 'dark', 'system'].includes(saved.themeMode) ? saved.themeMode
      : ['light', 'dark'].includes(legacyTheme) ? legacyTheme : 'system';
    const motionMode = ['full', 'reduced', 'system'].includes(saved.motionMode) ? saved.motionMode : 'system';
    const lang = 'en';
    return { themeMode, motionMode, lang };
  }
  function resolve(preferences, system = {}) {
    const prefs = normalize(preferences);
    return {
      theme: prefs.themeMode === 'system' ? system.dark === true ? 'dark' : 'light' : prefs.themeMode,
      reducedMotion: prefs.motionMode === 'reduced' || (prefs.motionMode === 'system' && system.reducedMotion === true),
      highContrast: system.highContrast === true
    };
  }
  function apply(element, state) {
    element.dataset.theme = state.theme;
    element.dataset.reducedMotion = String(state.reducedMotion);
    element.dataset.highContrast = String(state.highContrast);
  }
  function palette(state = {}) {
    if (state.highContrast) return { surface: 'Canvas', background: 'Canvas', text: 'CanvasText', muted: 'CanvasText', border: 'CanvasText', hover: 'Canvas', inverted: 'Canvas' };
    return state.theme === 'light'
      ? { surface: '#ffffff', background: '#f4f5f7', text: '#171b20', muted: '#505b66', border: '#b8c2cc', hover: '#e7ecf1', inverted: '#ffffff' }
      : { surface: '#1c2024', background: '#111318', text: '#f4f5f7', muted: '#b4bdc6', border: '#414950', hover: '#293038', inverted: '#111318' };
  }
  const api = { normalize, resolve, apply, palette };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ORIXAppearance = api;
})(globalThis);
