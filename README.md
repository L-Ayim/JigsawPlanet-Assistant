# Jigsaw Planet Assistant

A minimal CLI tool that:

1. Scrapes Jigsaw Planet to list available puzzles.
2. Opens a browser window for your chosen puzzle.
3. Overlays each puzzle piece with its load-order number.

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
   npm install puppeteer
   ```

---

## Usage

Run:

```bash
node capture.js
```

1. A list of puzzles (title + index) will appear.  
2. Enter a number to open that puzzle in a browser.  
3. Each piece will be badged with its load-order ID.  
4. Press “L” to toggle badges on/off.  
5. Close the browser when done.

---

## Troubleshooting

- If no puzzles show up, check your internet connection or increase the timeout in `capture.js`.  
- If Puppeteer times out, try raising the `timeout` values around `page.goto` and `waitForSelector`.  

---

## Author

Lawrence Ayim  
GitHub: [L-Ayim](https://github.com/L-Ayim)  
