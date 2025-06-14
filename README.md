# Jigsaw Planet Assistant

A lightweight Electron app that lists playable puzzles from jigsawplanet.com and overlays each puzzle piece with its loading order.

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

## Troubleshooting

If no puzzles load, try raising the timeout values in `capture.js`. Puppeteer is still used only for scraping the puzzle list.

## Author

Lawrence Ayim — [L-Ayim](https://github.com/L-Ayim)
