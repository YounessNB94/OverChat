
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overchat', {
  minimize: () => ipcRenderer.send('overchat:minimize'),

  hide: () => ipcRenderer.send('overchat:hide'),

  setSettingsOpen: (isOpen) =>
    ipcRenderer.send('overchat:settings', isOpen),
});
