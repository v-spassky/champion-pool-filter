// lolalytics.com adapter.
//
// Counter page (/lol/<champ>/counters/, optionally with a locale prefix like
// /de/lol/...) shows matchup cards:
//   <span><div class="... border ..."><a href="/lol/nami/vs/rakan/build/">
//     <div>Rakan</div><img alt="Rakan"> ... <div>307 Games</div></a></div></span>
// The intro paragraph also contains /vs/ links (plain text, no portrait); those
// are skipped by requiring an <img> inside the link. The page header also has a
// champion picker linking to /lol/<champ>/counters/, which is never touched.
(function (CPF) {
  const PAGE = /^(?:\/[a-z_]{2,6})?\/lol\/([^/]+)\/counters\/?$/i;
  const VS = /\/lol\/[^/]+\/vs\/([^/]+)\//i;

  CPF.sites.register({
    id: "lolalytics",
    name: "Lolalytics",

    matches(url) {
      return CPF.sites.hostIs(url, "lolalytics.com") && PAGE.test(url.pathname);
    },

    findRows(root, ctx) {
      const items = [];
      for (const a of root.querySelectorAll('a[href*="/vs/"]')) {
        const m = VS.exec(a.getAttribute("href") || "");
        if (!m || !a.querySelector("img")) continue;
        const key = ctx.resolve(m[1]);
        if (key) items.push({ element: a, key });
      }
      // Lift each link to its whole card so no empty bordered box is left behind.
      return CPF.sites.liftToRows(items).map((r) => ({ element: r.element, champion: r.key }));
    },
  });
})(CPF);
