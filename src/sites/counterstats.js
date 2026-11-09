// counterstats.net adapter.
//
// Champion page (/league-of-legends/<champ>) shows per-role counter boxes:
//   <a class="champ-box__row" href="/league-of-legends/nami/vs-blitzcrank/support/all">
//     ... <span class="champion">Blitzcrank</span> <span class="win">Win 51%</span> ...
//   </a>
(function (CPF) {
  const PAGE = /^\/league-of-legends\/([^/]+)\/?$/;
  const VS = /\/vs-([^/]+)/;

  CPF.sites.register({
    id: "counterstats",
    name: "CounterStats",

    matches(url) {
      return CPF.sites.hostIs(url, "counterstats.net") && PAGE.test(url.pathname);
    },

    findRows(root) {
      const rows = [];
      for (const a of root.querySelectorAll("a.champ-box__row")) {
        const nameEl = a.querySelector(".champion");
        const m = VS.exec(a.getAttribute("href") || "");
        const name = nameEl ? nameEl.textContent : m && m[1];
        if (name) rows.push({ element: a, champion: name });
      }
      return rows;
    },
  });
})(CPF);
