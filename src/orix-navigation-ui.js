'use strict';
((root) => {
  const aliases = { home: 'overview', karakter: 'appearance', wardrobe: 'appearance', apps: 'modules', connect: 'settings/connections', ai: 'settings/ai', general: 'settings/general', news: 'settings/updates', about: 'settings/about' };
  function resolveRoute(input) {
    const value = typeof input === 'string' ? (Object.hasOwn(aliases, input) ? aliases[input] : input) : '';
    if (['overview','appearance','modules'].includes(value)) return { page: value, section: null };
    if (value === 'settings') return { page: 'settings', section: 'general' };
    const section = value.startsWith('settings/') ? value.slice(9) : '';
    if (['general','connections','ai','updates','about'].includes(section)) return { page: 'settings', section };
    return { page: 'overview', section: null };
  }
  const modules = [
  { id: 'claude', icon: 'bot', tint: '#00c48a', core: true, en: ['AI assistants', 'Claude Code and Codex: ORIX shows whether your AI is busy, has a question or is done.'] },
  { id: 'buddy', icon: 'hand', tint: '#8fb8ff', en: ['Desktop context', 'Grab ORIX out of the island, drop it on anything and ask about it. Or check your spelling.'] },
  { id: 'spotify', pack: 'music', icon: 'music', tint: '#1ed760', en: ['Spotify', 'What is playing, with controls. '] },
  { id: 'focus', pack: 'focus', icon: 'timer', tint: '#ffb35c', en: ['Focus', 'A focus timer. ORIX keeps distractions away for a while.'] },
  { id: 'tray', pack: 'focus', icon: 'inbox', tint: '#7ab8ff', en: ['Tray', 'Drop files into the island and grab them again later.'] },
  { id: 'clips', pack: 'focus', icon: 'clipboard', tint: '#5ad1c4', en: ['Clipboard', 'Your last copies. Click one to copy it again.'] },
  { id: 'note', pack: 'focus', icon: 'note', tint: '#ffd166', en: ['Note', 'One quick note, always at hand.'] },
  { id: 'clock', icon: 'clock', tint: '#a99bff', en: ['Clock', 'The time on your home screen.'] },
  { id: 'settings', icon: 'gear', tint: '#b8b9c0', core: true, en: ['Settings', 'This app. Always there via the gear.'] }
];
  const api = { resolveRoute, modules };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ORIXNavigation = api;
})(globalThis);
