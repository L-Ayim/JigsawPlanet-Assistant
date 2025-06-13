const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { scrapePuzzles, labelPuzzle } = require('../capture');

async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  await win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('get-puzzles', async () => {
    const puzzles = await scrapePuzzles();
    return puzzles;
  });

  ipcMain.handle('label-puzzle', async (_event, url) => {
    await labelPuzzle(url);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
