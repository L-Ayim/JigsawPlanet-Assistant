# Jigsaw Planet Assistant

A lightweight Electron app that lists playable puzzles from jigsawplanet.com and
overlays each puzzle piece with its loading order.

## Features

- **Automatic puzzle discovery** – puzzles are scraped from the front page of
  Jigsaw Planet using Puppeteer and displayed in a simple list.
- **Load order overlay** – when a puzzle is opened each piece is marked with the
  order it was downloaded. The labels follow the pieces as you move them around
  and can be toggled with the **L** key.
- **Windows launcher** – `start-jigsaw.ps1` checks that Node and all npm
  dependencies are installed before starting the Electron app.

## Prerequisites

- Node.js 14+
- Internet connection

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/L-Ayim/jigsaw-planet-assistant.git
cd jigsaw-planet-assistant
npm install
```

## Running

Start the GUI with:

```bash
npm start
```

On Windows you can also run:

```powershell
./start-jigsaw.ps1
```

Select a puzzle in the app to open it in a new Electron window. Each piece displays its load number; press **L** to toggle these labels.

## How it Works

- **Scraping puzzles** – `capture.js` launches a headless browser with Puppeteer
  and collects all playable puzzle links from the Jigsaw Planet homepage.
- **Labeling pieces** – when a puzzle is opened, the preload script tracks each
  image as it loads and overlays a numbered badge on every piece. The overlay
  keeps the numbers aligned as pieces are moved around.

## Troubleshooting

If no puzzles load, try raising the timeout values in `capture.js`. Puppeteer is still used only for scraping the puzzle list.

## Author

Lawrence Ayim — [L-Ayim](https://github.com/L-Ayim)
