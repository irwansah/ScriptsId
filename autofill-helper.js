(function () {
  function autofill(fillMap, options = {}) {
    const cfg = Object.assign(
      { intervalMs: 400, maxAttempts: 50, verbose: true },
      options
    );
    const keys = Object.keys(fillMap);
    if (!keys.length) return Promise.resolve({ success: 0, total: 0 });

    let attempts = 0;
    const done = new Set();

    return new Promise((resolve) => {
      const t = setInterval(() => {
        attempts++;
        if (cfg.verbose) console.log(`[autofill] attempt ${attempts}`);
        for (const sel of keys) {
          if (done.has(sel)) continue;
          const el = document.querySelector(sel);
          if (!el) continue;

          const val = fillMap[sel];
          if ("value" in el) {
            el.focus && el.focus();
            el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
            el.dispatchEvent(new Event("blur", { bubbles: true }));
          } else {
            el.textContent = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }

          done.add(sel);
          if (cfg.verbose) console.log(`[autofill] filled ${sel} -> "${val}"`);
        }

        if (done.size === keys.length || attempts >= cfg.maxAttempts) {
          clearInterval(t);
          resolve({ success: done.size, total: keys.length });
        }
      }, cfg.intervalMs);
    });
  }

  window.autofillHelper = { autofill };
  console.log("[autofillHelper] loaded, ready to use");
})();
