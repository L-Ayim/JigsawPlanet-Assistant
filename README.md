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

Select a puzzle in the app to open it. Each piece displays its load number; press **L** to toggle these labels.

## Troubleshooting

If no puzzles load or Puppeteer times out, try raising the timeout values in `capture.js`.

## Author

Lawrence Ayim — [L-Ayim](https://github.com/L-Ayim)
