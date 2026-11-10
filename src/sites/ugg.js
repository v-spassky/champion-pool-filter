// u.gg adapter.
//
// Counter page (/lol/champions/<champ>/counter) renders three lists
// ("Best Picks vs X", "Worst Picks vs X", "Best Lane Counters vs X").
// Each entry is a row link:
//   <a href="/lol/champions/taric/build"> ... <div class="... font-bold truncate">Taric</div> ... </a>
(function (CPF) {
  const PAGE = /^\/lol\/champions\/[^/]+\/counter/;
  const ROW_HREF = /^\/lol\/champions\/([a-z0-9]+)\/build\/?$/i;

  function findRows(root) {
    const rows = [];
    for (const a of root.querySelectorAll('a[href^="/lol/champions/"]')) {
      const match = ROW_HREF.exec(a.getAttribute("href"));
      // Only rows that look like list entries, so header/nav links to champion
      // builds are left alone. Every list row ends with a sample size
      // ("282 games"); the stat itself varies ("53.19% WR", "+457 GD15").
      if (!match || !/\d\s*games/i.test(a.textContent)) continue;
      rows.push({ element: a, champion: a.querySelector(".truncate")?.textContent ?? match[1] });
    }
    return rows;
  }

  CPF.sites.register({
    id: "ugg",
    name: "u.gg",
    ...CPF.sites.pages("u.gg", [[PAGE, findRows]]),
  });
})(CPF);
