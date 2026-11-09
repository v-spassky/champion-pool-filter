// u.gg adapter.
//
// Counter page (/lol/champions/<champ>/counter) renders three lists
// ("Best Picks vs X", "Worst Picks vs X", "Best Lane Counters vs X").
// Each entry is a row link:
//   <a href="/lol/champions/taric/build"> ... <div class="... font-bold truncate">Taric</div> ... </a>
(function (CPF) {
  const ROW_HREF = /^\/lol\/champions\/([a-z0-9]+)\/build\/?$/i;

  CPF.sites.register({
    id: "ugg",
    name: "u.gg",

    matches(url) {
      return CPF.sites.hostIs(url, "u.gg") && /^\/lol\/champions\/[^/]+\/counter/.test(url.pathname);
    },

    findRows(root) {
      const rows = [];
      for (const a of root.querySelectorAll('a[href^="/lol/champions/"]')) {
        const match = ROW_HREF.exec(a.getAttribute("href"));
        // Only rows that look like list entries, so header/nav links to champion
        // builds are left alone. Every list row ends with a sample size
        // ("282 games"); the stat itself varies ("53.19% WR", "+457 GD15").
        if (!match || !/\d\s*games/i.test(a.textContent)) continue;
        const nameEl = a.querySelector(".truncate");
        rows.push({ element: a, champion: nameEl ? nameEl.textContent : match[1] });
      }
      return rows;
    },
  });
})(CPF);
