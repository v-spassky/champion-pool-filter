// blitz.gg adapter.
//
// Counter page (/lol/champions/<Champ>/counters) has "<X> is strong against" /
// "<X> is weak against" tables:
//   <tbody data-testid="counters-strong-table-body">
//     <tr><td data-sort-key="name"><a href="/lol/champions/Swain/build?"><img alt="Swain"> <span>Swain</span></a></td>...</tr>
// The champion is read from the name cell's link. The summary sentence above the tables also links champions; it's
// left alone.
(function (CPF) {
  const PAGE = /^\/lol\/champions\/[^/]+\/counters/i;
  const NAME_LINKS = ':scope tbody[data-testid^="counters-"] tr > [data-sort-key="name"] a[href]';
  const LINK = /\/lol\/champions\/([^/?#]+)/i;

  const findRows = (root) => CPF.sites.linkRows(root, NAME_LINKS, LINK, (a) => a.closest("tr"));

  CPF.sites.register({
    id: "blitz",
    name: "Blitz",
    ...CPF.sites.pages("blitz.gg", [[PAGE, findRows]]),
  });
})(CPF);
