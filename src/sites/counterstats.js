// counterstats.net adapter.
//
// Champion page (/league-of-legends/<champ>) shows per-role counter boxes:
//   <a class="champ-box__row" href="/league-of-legends/nami/vs-blitzcrank/support/all">
//     ... <span class="champion">Blitzcrank</span> <span class="win">Win 51%</span> ...
//   </a>
// The champion is read from the "vs-" part of the link.
(function (CPF) {
  const PAGE = /^\/league-of-legends\/[^/]+\/?$/;
  const VS = /\/vs-([^/]+)/;

  const findRows = (root) => CPF.sites.linkRows(root, "a.champ-box__row", VS);

  CPF.sites.register({
    id: "counterstats",
    name: "CounterStats",
    ...CPF.sites.pages("counterstats.net", [[PAGE, findRows]]),
  });
})(CPF);
