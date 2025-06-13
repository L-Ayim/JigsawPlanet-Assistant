# Jigsaw Planet Assistant

A minimal tool that:

1. Scrapes Jigsaw Planet to list available puzzles.
2. Opens a browser window for your chosen puzzle.
3. Overlays each puzzle piece with its load-order number.

The included Electron GUI uses Tailwind CSS with a neutral 800 palette and a sky accent.

---

## Prerequisites

- Node.js v14 or later  
- Internet connection  

---

## Installation

1. Clone this repository:
   ```bash
   git clone git@github.com:L-Ayim/jigsaw-planet-assistant.git
   cd jigsaw-planet-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Usage

Launch the Electron GUI:

```bash
npm start
```

On Windows you can run the helper script instead:

```powershell
./start-jigsaw.ps1
```

In the GUI, click a puzzle title to open it in a new browser window. Each
piece will be badged with its load-order ID. Press "L" to toggle badges and
close the browser when done.

---

## Troubleshooting

- If no puzzles show up, check your internet connection or increase the timeout in `capture.js`.  
- If Puppeteer times out, try raising the `timeout` values around `page.goto` and `waitForSelector`.  

---

## Author

Lawrence Ayim  
GitHub: [L-Ayim](https://github.com/L-Ayim)  
