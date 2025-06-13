const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPuzzles: () => ipcRenderer.invoke('get-puzzles'),
  labelPuzzle: url => ipcRenderer.invoke('label-puzzle', url),
});
