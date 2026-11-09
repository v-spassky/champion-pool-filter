// Site adapter registry + shared helpers for writing adapters.
//
// To support a new stats website:
//   1. Create src/sites/<site>.js and call CPF.sites.register({...}) with the
//      adapter interface below.
//   2. In manifest.json add the site's domain to "content_scripts.matches"
//      (match the whole domain, not just counter pages, so SPA navigation into
//      a counter page is caught) and the file to the "js" list (after
//      registry.js, before filter.js).
//   3. Add the file to popup.html so the site shows up in the popup's site list.
//
// Adapter interface:
//   id:        string                 unique, stable id (used in settings)
//   name:      string                 human-readable label shown in the popup
//   matches(url: URL): boolean        true if the page is a counter page to filter
//   findRows(root: ParentNode, ctx): Array<{ element: HTMLElement, champion: string }>
//                                     every champion entry that may be filtered;
//                                     `champion` is any name/slug/id the site uses.
//       ctx.url      URL of the page
//       ctx.resolve  (text, {numeric}) -> canonical champion key or null
//       ctx.championCount  number of champions in the game (0 if unknown)
//   afterFilter?(rows, settings)      optional hook, e.g. to fix zebra striping
//
// Two ways to write findRows:
//   - Precise: select the row elements directly (see ugg.js, blitz.js).
//   - Heuristic: CPF.sites.heuristicRows() finds champion portraits and lifts
//     each to its row. Use when the markup is unknown or changes often.
(function (CPF) {
  const adapters = [];

  function register(adapter) {
    for (const field of ["id", "name", "matches", "findRows"]) {
      if (!Object.hasOwn(adapter, field)) throw new Error(`[CPF] Site adapter is missing "${field}"`);
    }
    adapters.push(adapter);
  }

  function forUrl(url) {
    return adapters.find((a) => a.matches(url)) || null;
  }

  function hostIs(url, domain) {
    return url.hostname === domain || url.hostname.endsWith(`.${domain}`);
  }

  // Champion from a portrait <img>: alt/title text, else the file name in src
  // (".../champion/MonkeyKing.png", ".../champx46/taric.webp", ".../square/blitzcrank-60x.png").
  function championFromImage(img, resolve) {
    for (const text of [img.getAttribute("alt"), img.getAttribute("title")]) {
      const key = text && resolve(text);
      if (key) return key;
    }
    const src = img.currentSrc || img.getAttribute("src") || img.dataset.src || "";
    const file = src.split(/[?#]/, 1)[0].split("/").pop() || "";
    const base = file.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]\d+x?\d*$/i, "");
    return resolve(base);
  }

  // Expands each item element to its "row": the largest ancestor that contains
  // no other champion. items: [{ element, key }] -> deduplicated [{ element, key }].
  function liftToRows(items, stopAt = document.body) {
    const owner = new Map(); // ancestor -> key, or "*" if it holds several champions
    for (const { element, key } of items) {
      for (let el = element; el && el !== stopAt; el = el.parentElement) {
        const prev = owner.get(el);
        if (prev === undefined) owner.set(el, key);
        else if (prev !== key) owner.set(el, "*");
      }
    }
    const rows = new Map();
    for (const { element, key } of items) {
      let row = element;
      while (row.parentElement && row.parentElement !== stopAt && owner.get(row.parentElement) === key) {
        row = row.parentElement;
      }
      rows.set(row, key);
    }
    return [...rows].map(([element, key]) => ({ element, key }));
  }

  // Containers that hold champion pickers/menus/tooltips rather than stats lists.
  const IGNORE =
    'nav, header, footer, dialog, select, template, [hidden], [aria-hidden="true"], ' +
    '[role="dialog"], [role="listbox"], [role="menu"], [role="combobox"], [role="tooltip"]';

  // A group listing (almost) every champion is a picker / champion index, not a
  // counter list — hiding it would break site navigation.
  const PICKER_COVERAGE = 0.85;

  const SEARCH_INPUT = 'input[type="text"], input[type="search"], input:not([type])';

  // Champion portraits under `roots`, excluding ignored containers and the page's own champion.
  function findPortraits(roots, resolve, subject) {
    const items = [];
    for (const root of roots) {
      for (const img of root.querySelectorAll("img")) {
        if (img.closest(IGNORE)) continue;
        const key = championFromImage(img, resolve);
        if (key && key !== subject) items.push({ element: img, key });
      }
    }
    return items;
  }

  // True if a group looks like a stats list rather than a picker, menu or stray portraits.
  function isStatsList(parent, group, { minGroup, championCount }) {
    if (group.length < minGroup || group.length > championCount) return false;
    const distinct = new Set(group.map((r) => r.key)).size;
    return distinct < championCount * PICKER_COVERAGE && !parent?.querySelector(SEARCH_INPUT);
  }

  // Generic finder: champion portraits -> rows -> keep only list-like groups
  // (>= minGroup sibling rows), ignoring the page's own champion.
  //   opts.scope     CSS selector limiting where to look (default: whole page)
  //   opts.subject   canonical key of the page's champion (e.g. "nami")
  //   opts.minGroup  minimum rows per list (default 4)
  function heuristicRows(root, ctx, { scope, subject, minGroup = 4 } = {}) {
    const roots = scope ? root.querySelectorAll(scope) : [root];
    const rows = liftToRows(findPortraits(roots, ctx.resolve, subject));
    const limits = { minGroup, championCount: ctx.championCount || 170 };
    const byContainer = Map.groupBy(rows, (row) => row.element.parentElement);
    const result = [];
    for (const [parent, group] of byContainer) {
      if (!isStatsList(parent, group, limits)) continue;
      for (const r of group) result.push({ element: r.element, champion: r.key });
    }
    return result;
  }

  // Page champion from a URL path regex with one capture group.
  function subjectFromPath(url, regex, resolve) {
    const m = regex.exec(url.pathname);
    return m ? resolve(decodeURIComponent(m[1])) : null;
  }

  CPF.sites = {
    register,
    forUrl,
    all: () => [...adapters],
    hostIs,
    championFromImage,
    liftToRows,
    heuristicRows,
    subjectFromPath,
  };
})(CPF);
