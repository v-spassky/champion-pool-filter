// leagueofgraphs.com adapter. Pages optionally have a locale prefix (/fr/champions/...).
//
// Counters page (/champions/counters/<champ>): three tables, "<Champ> is best against...", "<Champ> is countered
// by..." and "Best partner" (allies, left alone). Matchup rows link to the matchup, partner rows don't:
//   <a class="lolg-table__row" href="/champions/tier-list/janna/vs-mel"> <img alt="Mel"> Mel Support 61.3% ... </a>
//   <a class="lolg-table__row" href="/champions/tier-list/rammus"> ...                       (partner)
//
// Champion overview page (/champions/tier-list/<champ> and friends): a small 3 + 3 counters box with the same links:
//   <a class="lolg-counters__entry" href="/champions/tier-list/janna/vs-mel"> <img alt="Mel"> Mel 61.3% </a>
//
// The champion is read from the "vs-" part of the link.
(function (CPF) {
  const PAGE = /^(?:\/[a-z]{2})?\/champions\//i;
  const VS = /\/vs-([^/?#]+)/i;
  const ROWS = 'a.lolg-table__row[href*="/vs-"], a.lolg-counters__entry[href*="/vs-"]';

  CPF.sites.register({
    id: "leagueofgraphs",
    name: "League of Graphs",
    ...CPF.sites.pages("leagueofgraphs.com", [[PAGE, (root) => CPF.sites.linkRows(root, ROWS, VS)]]),
  });
})(CPF);
