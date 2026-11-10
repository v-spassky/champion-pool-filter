// counterstats.net adapter.
//
// Champion page (/league-of-legends/<champ>) shows per-role counter boxes:
//   <a class="champ-box__row" href="/league-of-legends/nami/vs-blitzcrank/support/all">
//     ... <span class="champion">Blitzcrank</span> <span class="win">Win 51%</span> ...
//   </a>
(function (CPF) {
  const PAGE = /^\/league-of-legends\/([^/]+)\/?$/;
  const VS = /\/vs-([^/]+)/;

  function findRows(root) {
    const rows = [];
    for (const a of root.querySelectorAll("a.champ-box__row")) {
      const name = a.querySelector(".champion")?.textContent ?? VS.exec(a.getAttribute("href") || "")?.[1];
      if (name) rows.push({ element: a, champion: name });
    }
    return rows;
  }

  CPF.sites.register({
    id: "counterstats",
    name: "CounterStats",
    ...CPF.sites.pages("counterstats.net", [[PAGE, findRows]]),
  });
})(CPF);
