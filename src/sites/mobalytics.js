// mobalytics.gg adapter. Pages optionally have a locale prefix (/de_de/lol/...). Class names are generated hashes
// (m-1f3cf6j), so rows are found by link shape and structure instead.
//
// Counters page (/lol/champions/<champ>/counters, "?wp=t" for worst picks): a table with one link per opponent:
//   <a href="/lol/champions/janna/counters/support/vs-poppy"> <div> <img alt="Poppy"> Poppy 52.7% 319 </div> </a>
// The champion is read from the "vs-" part. The "Overall Average" row and the "related champions" box don't link to
// a matchup, so they're left alone.
//
// Build page (/lol/champions/<champ>/build): "<Champ> Matchups Overview" has three boxes, always in this order:
// Weak Against, Strong Against, Best Synergy (allies, left alone):
//   <div>                                    (the group)
//     <div> <header> <h3>Weak Against</h3> <a href=".../counters"> </header>
//           <div> <a href="/lol/champions/poppy/build"> <img alt="Poppy"> Poppy 47.3% </a> ... </div> </div>
//     <div> ...Strong Against... </div>
//     <div> ...Best Synergy (DUO)... </div>
// The headings are translated, so the boxes are picked by position. The champion is read from the tile link.
(function (CPF) {
  const LOCALE = String.raw`(?:\/[a-z]{2}_[a-z]{2})?`;
  const COUNTERS_PAGE = new RegExp(String.raw`^${LOCALE}\/lol\/champions\/[^/]+\/counters\/?$`, "i");
  const BUILD_PAGE = new RegExp(String.raw`^${LOCALE}\/lol\/champions\/[^/]+\/build(?:\/[^/]+)?\/?$`, "i");
  const VS = /\/vs-([^/?#]+)/i;
  const TILE = /\/lol\/champions\/([^/?#]+)\/build\/?$/i;
  const COUNTER_BOXES = 2; // Weak Against, Strong Against

  function counterRows(root) {
    const rows = [];
    for (const a of root.querySelectorAll('a[href*="/counters/"][href*="/vs-"]:has(> div)')) {
      const m = VS.exec(a.getAttribute("href"));
      if (m) rows.push({ element: a, champion: decodeURIComponent(m[1]) });
    }
    return rows;
  }

  // The overview group: the parent of the boxes whose header links to the counters page.
  function overviewBoxes(root) {
    const header = root.querySelector('header:has(> a[href$="/counters"])');
    const group = header?.parentElement?.parentElement;
    return group ? [...group.children].slice(0, COUNTER_BOXES) : [];
  }

  function buildRows(root) {
    const rows = [];
    for (const box of overviewBoxes(root)) {
      for (const a of box.querySelectorAll(":scope > div > a[href]")) {
        const m = TILE.exec(a.getAttribute("href"));
        if (m) rows.push({ element: a, champion: decodeURIComponent(m[1]) });
      }
    }
    return rows;
  }

  CPF.sites.register({
    id: "mobalytics",
    name: "Mobalytics",

    matches(url) {
      return (
        CPF.sites.hostIs(url, "mobalytics.gg") && (COUNTERS_PAGE.test(url.pathname) || BUILD_PAGE.test(url.pathname))
      );
    },

    findRows(root, ctx) {
      return BUILD_PAGE.test(ctx.url.pathname) ? buildRows(root) : counterRows(root);
    },
  });
})(CPF);
