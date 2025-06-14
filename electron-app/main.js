const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { scrapePuzzles } = require('../capture');

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

  ipcMain.handle('label-puzzle', async (event, url) => {
    // Load the selected puzzle in the existing window instead of opening
    // a new one. puzzlePreload.js will be injected by preload.js when the
    // window navigates to jigsawplanet.com, keeping everything in a single
    // window.
    const win = BrowserWindow.fromWebContents(event.sender);
    await win.loadURL(url);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
