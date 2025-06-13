// capture.js
const puppeteer = require('puppeteer');

async function scrapePuzzles() {
  const headlessBrowser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const [headlessPage] = await headlessBrowser.pages();

  await headlessPage.goto('https://www.jigsawplanet.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await new Promise(res => setTimeout(res, 2000));

  const puzzles = await headlessPage.evaluate(() => {
    const anchors = Array.from(
      document.querySelectorAll('a[href*="?rc=play&pid="]')
    );
    const seen = new Set();
    const list = [];

    for (const a of anchors) {
      const href = a.href;
      if (seen.has(href)) continue;
      seen.add(href);

      let title = a.querySelector('img')?.alt?.trim();
      if (!title) title = a.getAttribute('title')?.trim();
      if (!title) title = a.innerText.trim();
      if (!title) title = href;

      list.push({ title, url: href });
    }
    return list;
  });

  if (!puzzles.length) {
    console.error('❌ No playable puzzles found on jigsawplanet.com');
    await headlessBrowser.close();
    return [];
  }

  await headlessBrowser.close();
  return puzzles;
}

async function labelPuzzle(selectedUrl) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized'],
    defaultViewport: null,
  });
  const [page] = await browser.pages();

  await page.evaluateOnNewDocument(() => {
    window.inlinePieces = [];
    window._pieceCount = 0;

    const proto = HTMLImageElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'src');
    Object.defineProperty(proto, 'src', {
      set(v) {
        const ret = desc.set.call(this, v);
        if (
          typeof v === 'string' &&
          v.startsWith('data:image/png;base64,') &&
          !this.dataset.pieceId
        ) {
          const id = ++window._pieceCount;
          this.dataset.pieceId = id;
          window.inlinePieces.push({ id, time: performance.now() });
        }
        return ret;
      },
      get() {
        return desc.get.call(this);
      },
      configurable: true,
      enumerable: true,
    });
  });

  await page.goto(selectedUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await page.waitForSelector('img[data-piece-id]', { timeout: 20000 });
  await new Promise(res => setTimeout(res, 2000));

  const pieces = await page.evaluate(() => {
    const start = Math.min(...window.inlinePieces.map(p => p.time));
    return window.inlinePieces
      .map(p => ({ id: p.id, t: (p.time - start).toFixed(1) }))
      .sort((a, b) => a.t - b.t);
  });

  await page.evaluate(pieces => {
    const labeledBadges = {};

    const overlay = document.createElement('div');
    overlay.id = 'badgeOverlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 99999,
    });
    document.body.appendChild(overlay);

    function isInViewport(rect) {
      return !(
        rect.right < 0 ||
        rect.bottom < 0 ||
        rect.left > window.innerWidth ||
        rect.top > window.innerHeight
      );
    }

    for (const { id } of pieces) {
      const img = document.querySelector(`img[data-piece-id="${id}"]`);
      if (!img) continue;

      const rect = img.getBoundingClientRect();
      const badge = document.createElement('div');
      badge.className = 'piece-num';
      Object.assign(badge.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        transform: `translate(${rect.left + 2}px, ${rect.top + 2}px)`,
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 'bold',
        padding: '2px 4px',
        borderRadius: '3px',
        pointerEvents: 'none',
        zIndex: 100000,
      });
      badge.textContent = id;
      overlay.appendChild(badge);
      labeledBadges[id] = badge;
    }

    function updateBadges() {
      for (const pieceId in labeledBadges) {
        const img = document.querySelector(`img[data-piece-id="${pieceId}"]`);
        if (!img) {
          labeledBadges[pieceId].style.display = 'none';
          continue;
        }
        const rect = img.getBoundingClientRect();
        const badge = labeledBadges[pieceId];
        if (!isInViewport(rect)) {
          badge.style.display = 'none';
          continue;
        } else {
          badge.style.display = 'block';
        }
        badge.style.transform = `translate(${rect.left + 2}px, ${rect.top + 2}px)`;
      }
      requestAnimationFrame(updateBadges);
    }
    requestAnimationFrame(updateBadges);

    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        for (const pieceId in labeledBadges) {
          const img = document.querySelector(`img[data-piece-id="${pieceId}"]`);
          if (!img) continue;
          const rect = img.getBoundingClientRect();
          const badge = labeledBadges[pieceId];
          badge.style.transform = `translate(${rect.left + 2}px, ${rect.top + 2}px)`;
        }
      }, 100);
    });

    let badgesVisible = true;
    document.addEventListener('keydown', e => {
      if (e.key.toLowerCase() === 'l') {
        badgesVisible = !badgesVisible;
        overlay.style.display = badgesVisible ? 'block' : 'none';
      }
    });
  }, pieces);
}

// CLI functionality removed; this module is now used exclusively by the Electron GUI

module.exports = { scrapePuzzles, labelPuzzle };
