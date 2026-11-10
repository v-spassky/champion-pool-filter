// blitz.gg adapter.
//
// Counter page (/lol/champions/<Champ>/counters) has "<X> is strong against" /
// "<X> is weak against" tables:
//   <tbody data-testid="counters-strong-table-body">
//     <tr><td data-sort-key="name"><a href="/lol/champions/Swain/build?"><img alt="Swain"> <span>Swain</span></a></td>...</tr>
// The summary sentence above the tables also links champions; it's left alone.
(function (CPF) {
  const PAGE = /^\/lol\/champions\/[^/]+\/counters/i;

  function findRows(root) {
    return Array.from(root.querySelectorAll(':scope tbody[data-testid^="counters-"] tr'), (tr) => {
      const cell = tr.querySelector(':scope > [data-sort-key="name"]') || tr;
      const name = cell.querySelector(":scope img[alt]")?.getAttribute("alt") || cell.textContent;
      return { element: tr, champion: name };
    });
  }

  CPF.sites.register({
    id: "blitz",
    name: "Blitz",
    ...CPF.sites.pages("blitz.gg", [[PAGE, findRows]]),
  });
})(CPF);
