// Site adapter registry + small helpers for writing adapters. To support a new site, follow "Adding a new site" in
// the README; `npm run lint` checks the manifest side of it.
//
// Adapter interface:
//   id:        string                 unique, stable id (used in settings)
//   name:      string                 human-readable label shown in the popup
//   matches(url: URL): boolean        true if the page has counter lists to filter
//   findRows(root: ParentNode, url: URL): Array<{ element: HTMLElement, champion: string }>
//                                     every champion entry that may be filtered; `element` is what gets hidden or
//                                     dimmed and `champion` is any name/slug/id the site uses.
// Most adapters get matches/findRows from pages() and build rows with linkRows().
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

  // { matches, findRows } for a site whose filtered pages are told apart by path:
  //   pages("op.gg", [[BUILD_PAGE, buildRows], [COUNTERS_PAGE, counterRows]])
  // The first path regex that matches picks the row finder.
  function pages(domain, list) {
    const pick = (url) => (hostIs(url, domain) ? list.find(([path]) => path.test(url.pathname)) : undefined);
    return {
      matches: (url) => pick(url) !== undefined,
      findRows: (root, url) => pick(url)[1](root),
    };
  }

  function decode(slug) {
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  }

  // Rows read from links: every element matching `selector` whose href matches `regex`; the champion is the
  // regex's first capture group. `toElement(a)` picks what gets filtered (default: the link itself); rows where it
  // returns nothing are skipped.
  function linkRows(root, selector, regex, toElement = (a) => a) {
    const rows = [];
    for (const a of root.querySelectorAll(selector)) {
      const m = regex.exec(a.getAttribute("href") || "");
      const element = m && toElement(a);
      if (element) rows.push({ element, champion: decode(m[1]) });
    }
    return rows;
  }

  CPF.sites = {
    register,
    forUrl,
    all: () => [...adapters],
    pages,
    linkRows,
  };
})(CPF);
