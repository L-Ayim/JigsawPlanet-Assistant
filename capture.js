// capture.js
const puppeteer = require('puppeteer');
const readline = require('readline');

(async () => {
  //
  // ────────────────────────────────────────────────────────────────────────────────
  // STAGE 1: SCRAPE PUZZLE NAMES + URLs (HEADLESS, NO-COUNTING)
  // ────────────────────────────────────────────────────────────────────────────────
  //
  const headlessBrowser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const [headlessPage] = await headlessBrowser.pages();

  // Go to the JigsawPlanet homepage (or any “gallery” page)
  await headlessPage.goto('https://www.jigsawplanet.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  // Give thumbnails / links a moment to render
  await new Promise(res => setTimeout(res, 2000));

  // Scrape all <a href*="?rc=play&pid="> → { title, url }
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

      // Try <img alt="..."> for a human-friendly title
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
    process.exit(1);
  }

  await headlessBrowser.close();

  // Print a 1-based menu of puzzle names (no piece counts)
  console.log('\n✂️  Available puzzles on jigsawplanet.com:\n');
  puzzles.forEach((p, idx) => {
    // Truncate long titles to 60 chars
    const shortTitle =
      p.title.length > 60 ? p.title.slice(0, 57) + '...' : p.title;
    console.log(`  [${idx + 1}] ${shortTitle}`);
  });
  console.log('\n');

  // Prompt the user to pick a puzzle by number (1-based)
  const chosenNum = await new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      `Enter the number of the puzzle you want to label (1–${puzzles.length}):\n> `,
      answer => {
        rl.close();
        resolve(answer.trim());
      }
    );
  });

  const chosenIndex = Number(chosenNum);
  if (
    Number.isNaN(chosenIndex) ||
    chosenIndex < 1 ||
    chosenIndex > puzzles.length
  ) {
    console.error(`❌ Invalid choice: ${chosenNum}`);
    process.exit(1);
  }

  // Convert 1-based to 0-based index
  const selectedPuzzle = puzzles[chosenIndex - 1];
  const { title: selectedTitle, url: selectedUrl } = selectedPuzzle;
  console.log(
    `\n🔎 You selected [${chosenIndex}] ${selectedTitle}\n   → ${selectedUrl}\n`
  );

  //
  // ────────────────────────────────────────────────────────────────────────────────
  // STAGE 2: OPEN VISIBLE BROWSER TO LABEL THE SELECTED PUZZLE
  // ────────────────────────────────────────────────────────────────────────────────
  //
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized'],
    defaultViewport: null,
  });
  const [page] = await browser.pages();

  // ── INJECT INLINE-IMAGE TAGGING LOGIC BEFORE NAVIGATION ─────────────────────────
  await page.evaluateOnNewDocument(() => {
    window.inlinePieces = [];
    window._pieceCount = 0;

    const proto = HTMLImageElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'src');
    Object.defineProperty(proto, 'src', {
      set(v) {
        const ret = desc.set.call(this, v);
        if (typeof v === 'string' && v.startsWith('data:image/png;base64,')) {
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

  // Navigate to the chosen puzzle URL
  await page.goto(selectedUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  // Wait for at least one piece (with data-piece-id) to appear (max 20s)
  await page.waitForSelector('img[data-piece-id]', { timeout: 20000 });
  // Give another 2 seconds so all pieces finish streaming
  await new Promise(res => setTimeout(res, 2000));

  // Collect & sort all pieces by load time
  const pieces = await page.evaluate(() => {
    const start = Math.min(...window.inlinePieces.map(p => p.time));
    return window.inlinePieces
      .map(p => ({ id: p.id, t: (p.time - start).toFixed(1) }))
      .sort((a, b) => a.t - b.t);
  });

  // ── INJECT BADGE-OVERLAY LOGIC ─────────────────────────────────────────────────
  await page.evaluate(pieces => {
    const labeledBadges = {};

    // Create a full-screen overlay <div> for badges
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

    // Utility: check if a rect is within the viewport
    function isInViewport(rect) {
      return !(
        rect.right < 0 ||
        rect.bottom < 0 ||
        rect.left > window.innerWidth ||
        rect.top > window.innerHeight
      );
    }

    // Label each piece exactly once
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

    // requestAnimationFrame loop to keep each badge positioned
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

    // Debounce window resize so badges recalc at end of resizing
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

    // Toggle badge visibility with the “L” key
    let badgesVisible = true;
    document.addEventListener('keydown', e => {
      if (e.key.toLowerCase() === 'l') {
        badgesVisible = !badgesVisible;
        overlay.style.display = badgesVisible ? 'block' : 'none';
      }
    });
  }, pieces);

  // The visible browser now stays open with badges tracking each piece.
  // You can drag pieces around, resize the window, toggle badges with “L,” etc.
})();
