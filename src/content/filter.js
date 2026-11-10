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
  let isScheduled = false;
  let observer = null;
  let isApplying = false;

  function clear() {
    for (const el of document.querySelectorAll(`.${HIDDEN}, .${DIMMED}`)) el.classList.remove(HIDDEN, DIMMED);
  }

  function apply() {
    isScheduled = false;
    if (!settings) return;

    const url = new URL(location.href);
    const adapter = CPF.sites.forUrl(url);
    isApplying = true;
    try {
      clear();
      if (!adapter || !settings.enabled || settings.sites[adapter.id] === false || settings.pool.length === 0) {
        return;
      }

      const pool = new Set(settings.pool);
      const cls = settings.mode === "dim" ? DIMMED : HIDDEN;
      const rows = adapter.findRows(document, { url, resolve });
      for (const row of rows) {
        // Fall back to plain normalization if the catalog couldn't be loaded.
        const key = resolve(row.champion) || CPF.champions.championKey(row.champion);
        row.inPool = pool.has(key);
        if (!row.inPool) row.element.classList.add(cls);
      }
      if (adapter.afterFilter) adapter.afterFilter(rows, settings);
    } catch (error) {
      console.warn(`[CPF] ${adapter && adapter.id} adapter failed`, error);
    } finally {
      // Drop the mutation records caused by our own class changes.
      if (observer) observer.takeRecords();
      isApplying = false;
    }
  }

  function schedule() {
    if (isScheduled || isApplying) return;
    isScheduled = true;
    setTimeout(apply, DEBOUNCE_MS);
  }

  function watchDom() {
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function watchNavigation() {
    // SPA route changes (pushState/replaceState aren't observable from an isolated
    // world, so poll the URL cheaply).
    let last = location.href;
    setInterval(() => {
      if (location.href === last) {
        return;
      }

      last = location.href;
      schedule();
    }, 500);
    addEventListener("popstate", schedule);
  }

  async function init() {
    const [loaded, catalog] = await Promise.all([CPF.settings.get(), CPF.champions.loadCatalog()]);
    settings = loaded;
    resolve = CPF.champions.createResolver(catalog);
    CPF.settings.onChange((next) => {
      settings = next;
      schedule();
    });
    watchDom();
    watchNavigation();
    apply();
  }

  init();
})(CPF);
