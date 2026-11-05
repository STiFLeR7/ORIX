// The settings app (settings-app.html): the island's lists and clicks, the AI choice, our news, and Robo's live face.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('settingsApp', {
  tool: view => ipcRenderer.invoke('settings-app:tool', view),
  onAppearance: callback => {
    if (typeof callback !== 'function') return () => {};
    const fn = (_event, value) => callback(value);
    ipcRenderer.on('orix:appearance-committed', fn);
    return () => ipcRenderer.removeListener('orix:appearance-committed', fn);
  },
  system: {
    get: () => ipcRenderer.invoke('orix:system-get'),
    onChange: callback => {
      if (typeof callback !== 'function') return () => {};
      const fn = (_event, state) => callback(state);
      ipcRenderer.on('orix:system-changed', fn);
      return () => ipcRenderer.removeListener('orix:system-changed', fn);
    }
  },
  layer: {
    get: () => ipcRenderer.invoke('orix:layer-get'),
    set: visible => ipcRenderer.invoke('orix:layer-set', visible),
    onChange: callback => {
      if (typeof callback !== 'function') return () => {};
      const listener = (_event, value) => callback(value);
      ipcRenderer.on('orix:layer-changed', listener);
      return () => ipcRenderer.removeListener('orix:layer-changed', listener);
    }
  },
  get: req => ipcRenderer.invoke('settings-app:get', req),
  dirty: on => ipcRenderer.send('settings-app:dirty', !!on),
  theme: (theme, lang) => ipcRenderer.send('settings-app:theme', { theme, lang }),
  news: () => ipcRenderer.invoke('settings-app:news'),
  about: () => ipcRenderer.invoke('settings-app:about'),
  // updates from twocode.nl (auto-update.cjs)
  update: () => ipcRenderer.invoke('update:state'),
  installUpdate: () => ipcRenderer.send('update:install'),
  onUpdate: callback => { const fn = (_e, v) => callback(v); ipcRenderer.on('update:state', fn); return () => ipcRenderer.removeListener('update:state', fn); },
  home: () => ipcRenderer.invoke('settings-app:home'),
  connections: () => ipcRenderer.invoke('settings-app:connections'),
  connect: (id, on) => ipcRenderer.invoke('settings-app:connect', { id, on }),
  openUrl: url => ipcRenderer.send('settings-app:open-url', url),
  // packs bought on twocode.nl (license-main.cjs)
  license: {
    get: () => ipcRenderer.invoke('license:get'),
    activate: code => ipcRenderer.invoke('license:activate', String(code || '')),
    remove: () => ipcRenderer.invoke('license:remove'),
    onChange: callback => { const fn = (_e, v) => callback(v); ipcRenderer.on('license:changed', fn); return () => ipcRenderer.removeListener('license:changed', fn); }
  },
  // AI & Chat: the same settings the project chat and Robo the buddy use (project-mode-main.js)
  ai: {
    get: check => ipcRenderer.invoke('ai-settings:get', { check: check === true }), // check: really ask Codex (can take a moment)
    setProvider: provider => ipcRenderer.invoke('ai-settings:set-provider', provider),
    setKey: (type, key) => ipcRenderer.invoke('ai-settings:set-key', { type, key }),
    clearKey: type => ipcRenderer.invoke('ai-settings:clear-key', type),
    setModel: model => ipcRenderer.invoke('ai-settings:set-model', model),
    test: () => ipcRenderer.invoke('ai-settings:test'),
    chatgptLogin: () => ipcRenderer.invoke('ai-settings:chatgpt-login'),
    chatgptCancel: () => ipcRenderer.invoke('ai-settings:chatgpt-cancel'),
    chatgptLogout: () => ipcRenderer.invoke('ai-settings:chatgpt-logout')
  },
  onGoto: callback => { const fn = (_e, tab) => callback(tab); ipcRenderer.on('settings-app:goto', fn); return () => ipcRenderer.removeListener('settings-app:goto', fn); },
  onFace: callback => { const fn = (_e, url) => callback(url); ipcRenderer.on('settings-app:face', fn); return () => ipcRenderer.removeListener('settings-app:face', fn); }
});
