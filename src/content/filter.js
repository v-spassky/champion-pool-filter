// Site-agnostic filtering engine. Picks the adapter for the current page,
// applies the user's champion pool, and re-applies on DOM changes, SPA
// navigation and settings changes.
(function (CPF) {
  const HIDDEN = "cpf-hidden";
  const DIMMED = "cpf-dimmed";

  // Sites re-render constantly (ads, live stats); batch DOM changes.
  const DEBOUNCE_MS = 120;

  let settings = null;
  let resolve = null;
  let pool = new Set();
  let isScheduled = false;
  // Elements filtered by the last run -> the class they got. Each run only touches rows whose state changed.
  let marked = new Map();

  // Element -> class for every row on the page that should be hidden or dimmed right now.
  function targets() {
    const url = new URL(location.href);
    const adapter = CPF.sites.forUrl(url);
    const next = new Map();
    const isOn = adapter && settings.enabled && CPF.settings.isSiteEnabled(settings, adapter.id) && pool.size > 0;
    if (!isOn) return next;

    const cls = settings.mode === "dim" ? DIMMED : HIDDEN;
    try {
      const rows = adapter.findRows(document, url);
      for (const row of rows) {
        if (!pool.has(resolve(row.champion))) next.set(row.element, cls);
      }
    } catch (error) {
      console.warn(`[CPF] ${adapter.id} adapter failed`, error);
      next.clear();
    }
    return next;
  }

  function apply() {
    isScheduled = false;
    const next = targets();
    for (const [el, cls] of marked) {
      if (next.get(el) !== cls) el.classList.remove(cls);
    }
    // Checked against the element itself, not `marked`: a site re-render may have reset its class attribute.
    for (const [el, cls] of next) {
      if (!el.classList.contains(cls)) el.classList.add(cls);
    }
    marked = next;
  }

  function schedule() {
    if (isScheduled) return;
    isScheduled = true;
    setTimeout(apply, DEBOUNCE_MS);
  }

  function useSettings(next) {
    settings = next;
    pool = new Set(settings.pool);
  }

  function watchDom() {
    // Class changes aren't watched (no `attributes`), so the engine's own edits don't retrigger it.
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function watchNavigation() {
    // SPA route changes (pushState/replaceState aren't observable from an isolated
    // world, so poll the URL cheaply).
    let last = location.href;
    setInterval(() => {
      if (location.href === last) return;
      last = location.href;
      schedule();
    }, 500);
    addEventListener("popstate", schedule);
  }

  async function init() {
    const [loaded, catalog] = await Promise.all([CPF.settings.get(), CPF.champions.loadCatalog()]);
    useSettings(loaded);
    resolve = CPF.champions.createResolver(catalog);
    CPF.settings.onChange((next) => {
      useSettings(next);
      schedule();
    });
    // Classes left on the page by a previous instance (e.g. the extension was reloaded) get cleared by the first run.
    for (const el of document.querySelectorAll(`.${HIDDEN}`)) marked.set(el, HIDDEN);
    for (const el of document.querySelectorAll(`.${DIMMED}`)) marked.set(el, DIMMED);
    watchDom();
    watchNavigation();
    apply();
  }

  init();
})(CPF);
