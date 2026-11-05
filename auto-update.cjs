'use strict';
// ORIX releases are installed manually; never trust or install the recovered updater's packages.
const { app, ipcMain } = require('electron');
const state = () => ({ current: app.getVersion(), ready: null, full: null, page: '', enabled: false });
const ours = event => String(event.senderFrame?.url || '').startsWith('file:');
ipcMain.handle('update:state', event => ours(event) ? state() : null);
ipcMain.on('update:install', () => {});
module.exports = { state, check: async () => state() };
