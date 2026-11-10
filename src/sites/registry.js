// Site adapter registry.
//
// To support a new stats website:
//   1. Save a counter page with the list fully loaded (see "Adding a new site" in the README) and find the markup
//      of one row and where the champion's name or slug can be read from (a link is best, an <img alt> works too).
//   2. Create src/sites/<site>.js and call CPF.sites.register({...}) with the adapter interface below.
//   3. In manifest.json add the site's domain to "host_permissions" and "content_scripts.matches" (match the whole
//      domain, not just counter pages, so SPA navigation into a counter page is caught) and the file to the "js"
//      list (after registry.js, before filter.js).
//   4. Add the file to popup.html so the site shows up in the popup's site list.
//
// Adapter interface:
//   id:        string                 unique, stable id (used in settings)
//   name:      string                 human-readable label shown in the popup
//   matches(url: URL): boolean        true if the page has counter lists to filter
//   findRows(root: ParentNode, ctx): Array<{ element: HTMLElement, champion: string }>
//                                     every champion entry that may be filtered; `element` is what gets hidden or
//                                     dimmed and `champion` is any name/slug/id the site uses.
//       ctx.url      URL of the page
//       ctx.resolve  (text, {numeric}) -> canonical champion key or null
//   afterFilter?(rows, settings)      optional hook, e.g. to fix zebra striping
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

  CPF.sites = {
    register,
    forUrl,
    all: () => [...adapters],
    hostIs,
  };
})(CPF);
