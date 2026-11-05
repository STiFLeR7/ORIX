'use strict';
// Existing ORIX SVG shapes and attributed local brand assets; no font-glyph substitutes.
((root) => {
  const shapes = {
  "home": "<path d=\"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><path d=\"M9 22V12h6v10\"/>",
  "appearance": "<path d=\"M21 4h-7\"/><path d=\"M10 4H3\"/><path d=\"M21 12h-9\"/><path d=\"M8 12H3\"/><path d=\"M21 20h-5\"/><path d=\"M12 20H3\"/><path d=\"M14 2v4\"/><path d=\"M8 10v4\"/><path d=\"M16 18v4\"/>",
  "grid": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1.5\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1.5\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1.5\"/><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1.5\"/>",
  "settings": "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "context": "<path d=\"M18 11V6a2 2 0 0 0-4 0\"/><path d=\"M14 10V4a2 2 0 0 0-4 0v2\"/><path d=\"M10 10.5V6a2 2 0 0 0-4 0v8\"/><path d=\"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15\"/>",
  "focus": "<path d=\"M10 2h4\"/><path d=\"m12 14 3-3\"/><circle cx=\"12\" cy=\"14\" r=\"8\"/>",
  "tray": "<path d=\"M22 12h-6l-2 3h-4l-2-3H2\"/><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"/>",
  "clipboard": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/>",
  "note": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>",
  "moon": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>",
  "ai": "<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\"/>",
  "download": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5\"/><path d=\"M12 15V3\"/>",
  "external": "<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>",
  "wifi": "<path d=\"M2 8.8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.3a6 6 0 0 1 7 0\"/><circle cx=\"12\" cy=\"19\" r=\".5\"/>"
};
  const brands = { claudecode: ['claudecode.svg'], claude: ['claude-ai-icon.svg'], codex: ['codex_dark.svg','codex_light.svg'], chatgpt: ['openai_dark.svg','openai.svg'], spotify: ['spotify.svg'] };
  function html(name) {
    if (Object.hasOwn(brands, name)) {
      return '<span class="orix-brand-icon" aria-hidden="true">' + brands[name].map((file,index) => '<img class="' + (brands[name].length === 1 ? 'brand-any' : index === 0 ? 'brand-dark' : 'brand-light') + '" src="../assets/icons/brands/' + file + '" alt="">').join('') + '</span>';
    }
    if (!Object.hasOwn(shapes, name)) return '';
    return '<svg class="orix-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + shapes[name] + '</svg>';
  }
  function asset(name, theme) {
    if (!Object.hasOwn(brands, name)) return '';
    return '../assets/icons/brands/' + (theme === 'light' && brands[name][1] ? brands[name][1] : brands[name][0]);
  }
  const api = { html, asset };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ORIXIcons = api;
})(globalThis);
