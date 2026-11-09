// blitz.gg adapter.
//
// Counter page (/lol/champions/<Champ>/counters) has "<X> is strong against" /
// "<X> is weak against" tables:
//   <tbody data-testid="counters-strong-table-body">
//     <tr><td data-sort-key="name"><a href="/lol/champions/Swain/build?"><img alt="Swain"> <span>Swain</span></a></td>...</tr>
// The summary sentence above the tables also links champions; it's left alone.
(function (CPF) {
  CPF.sites.register({
    id: "blitz",
    name: "Blitz",

    matches(url) {
      return CPF.sites.hostIs(url, "blitz.gg") && /^\/lol\/champions\/[^/]+\/counters/i.test(url.pathname);
    },

    findRows(root) {
      const rows = [];
      for (const tr of root.querySelectorAll(':scope tbody[data-testid^="counters-"] tr')) {
        const cell = tr.querySelector(':scope > [data-sort-key="name"]') || tr;
        const img = cell.querySelector(":scope img[alt]");
        const name = (img && img.getAttribute("alt")) || cell.textContent;
        rows.push({ element: tr, champion: name });
      }
      return rows;
    },
  });
})(CPF);
