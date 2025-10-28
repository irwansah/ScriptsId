(function () {
  /**
   * Mengisi input HTML sesuai selector dan value
   * @param {Object.<string, string|boolean>} fillMap - Map selector => value
   * @param {Object} [options]
   */
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
          if (el.type === "checkbox") {
            el.checked = !!val;
            el.dispatchEvent(new Event("change", { bubbles: true }));
            done.add(sel);
            continue;
          }

          if ("value" in el) {
            el.focus?.();
            el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
            el.dispatchEvent(new Event("blur", { bubbles: true }));
          } else {
            el.textContent = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }

          done.add(sel);
          if (cfg.verbose)
            console.log(`[autofill] filled ${sel} -> "${val}"`);
        }

        if (done.size === keys.length || attempts >= cfg.maxAttempts) {
          clearInterval(t);
          resolve({ success: done.size, total: keys.length });
        }
      }, cfg.intervalMs);
    });
  }

  /**
   * Shortcut khusus untuk form antributikserpong
   * Mengisi otomatis input dengan id:
   *  #name, #ktp, #phone_number, #check, #check_2, #captcha_input
   * lalu menyalin teks dari #captcha-box
   */
  async function fillAntriButik(data) {
    const captchaBox = document.querySelector("#captcha-box");
    const captchaText = captchaBox?.textContent?.trim() ?? "";

    const fillMap = {
      "#name": data.name || "",
      "#ktp": data.ktp || "",
      "#phone_number": data.phone || "",
      "#check": true,
      "#check_2": true,
      "#captcha_input": captchaText,
    };

    const result = await autofill(fillMap, { verbose: true });
    console.log("[autofillHelper] done:", result);
    return result;
  }

  window.autofillHelper = { autofill, fillAntriButik };
  console.log("[autofillHelper] loaded, ready to use");
})();
