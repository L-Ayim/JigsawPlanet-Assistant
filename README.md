# Jigsaw Planet Assistant

A minimal CLI tool that:

1. Scrapes Jigsaw Planet to list available puzzles.
2. Opens a browser window for your chosen puzzle.
3. Overlays each puzzle piece with its load-order number.

The included Electron GUI features a minimalist dark theme built with Tailwind CSS.

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

Run the CLI:

```bash
node capture.js
```

Or launch the GUI (now styled with Tailwind CSS in dark mode):

```bash
npm start
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
