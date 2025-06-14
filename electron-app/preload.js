const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  getPuzzles: () => ipcRenderer.invoke('get-puzzles'),
  labelPuzzle: url => ipcRenderer.invoke('label-puzzle', url),
});

// When navigating to a jigsawplanet.com puzzle, inject the overlay code that
// was previously provided by puzzlePreload.js. Evaluating the file here keeps
// everything working when the same window loads the puzzle page.
if (location.hostname.includes('jigsawplanet.com')) {
  const preloadPath = path.join(__dirname, 'puzzlePreload.js');
  const script = fs.readFileSync(preloadPath, 'utf8');
  // Execute the preload script in this context
  require('vm').runInThisContext(script, { filename: 'puzzlePreload.js' });
}
