// op.gg adapter. Two pages, both optionally with a locale prefix (/ko/lol/...):
//
// Counters page (/lol/champions/<champ>/counters/<role>): a scrollable opponent list in the sidebar; picking one shows
// that matchup on the right:
//   <aside> ... <ul> <li> (radio) <img alt="Lulu"> <span>Lulu</span> <strong>50.87%</strong> <span>2943</span> </li>
// The rows have no links, so the champion is read from the portrait's alt text.
//
// Build page (/lol/champions/<champ>/build/<role>): a "<Champ> Counter" box with "Weak against" / "Strong against"
// tiles, each linking to the matchup:
//   <li><a href="/lol/champions/janna/counters/support?...&target_champion=poppy"> <img alt="Poppy"> 46.64% ...</a></li>
// The champion is read from target_champion. The page's "Synergies" box lists allies and is left alone.
(function (CPF) {
  const S = CPF.sites;
  const COUNTERS_PAGE = /^(?:\/[a-z_-]{2,8})?\/lol\/champions\/[^/]+\/counters/i;
  const BUILD_PAGE = /^(?:\/[a-z_-]{2,8})?\/lol\/champions\/[^/]+\/build/i;
  const MATCHUP_LINKS = 'a[href*="/counters"][href*="target_champion="]';
  const OPPONENT_PORTRAITS = "aside ul > li img[alt]";

  function counterRows(root) {
    return Array.from(root.querySelectorAll(OPPONENT_PORTRAITS), (img) => ({
      element: img.closest("li"),
      champion: img.getAttribute("alt"),
    }));
  }

  function buildRows(root, base) {
    const rows = [];
    for (const a of root.querySelectorAll(MATCHUP_LINKS)) {
      const champion = new URL(a.getAttribute("href"), base).searchParams.get("target_champion");
      if (champion) rows.push({ element: a.closest("li") || a, champion });
    }
    return rows;
  }

  S.register({
    id: "opgg",
    name: "OP.GG",

    matches(url) {
      return S.hostIs(url, "op.gg") && (COUNTERS_PAGE.test(url.pathname) || BUILD_PAGE.test(url.pathname));
    },

    findRows(root, ctx) {
      return BUILD_PAGE.test(ctx.url.pathname) ? buildRows(root, ctx.url) : counterRows(root);
    },
  });
})(CPF);
