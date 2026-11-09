// Sites whose counter lists are rendered client-side or are behind bot
// protection, so their exact markup couldn't be pinned down. They use the
// generic portrait-based finder (CPF.sites.heuristicRows), which works on
// any page that shows a list of champion portraits.
//
// If one of these misbehaves, replace its entry with a precise adapter in its
// own file (see ugg.js / blitz.js for examples).
(function (CPF) {
  const S = CPF.sites;

  const HEURISTIC_SITES = [
    {
      id: "opgg",
      name: "OP.GG",
      domain: "op.gg",
      // /lol/champions/nami/counters, optionally with a locale prefix (/ko/lol/...)
      page: /^(?:\/[a-z_-]{2,8})?\/lol\/champions\/([^/]+)\/counters/i,
    },
    {
      id: "mobalytics",
      name: "Mobalytics",
      domain: "mobalytics.gg",
      // /lol/champions/nami/counters
      page: /^(?:\/[a-z_-]{2,8})?\/lol\/champions\/([^/]+)\/counters/i,
    },
    {
      id: "leagueofgraphs",
      name: "League of Graphs",
      domain: "leagueofgraphs.com",
      // /champions/counters/nami[/support...], optionally with a locale prefix (/fr/...)
      page: /^(?:\/[a-z_-]{2,8})?\/champions\/counters\/([^/]+)/i,
    },
  ];

  for (const site of HEURISTIC_SITES) {
    S.register({
      id: site.id,
      name: site.name,
      matches: (url) => S.hostIs(url, site.domain) && site.page.test(url.pathname),
      findRows: (root, ctx) =>
        S.heuristicRows(root, ctx, {
          scope: site.scope,
          subject: S.subjectFromPath(ctx.url, site.page, ctx.resolve),
          minGroup: site.minGroup,
        }),
    });
  }
})(CPF);
