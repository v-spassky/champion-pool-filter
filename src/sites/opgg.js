// op.gg adapter. Two pages, both optionally with a locale prefix (/ko/lol/...):
//
// Counters page (/lol/champions/<champ>/counters/<role>): a scrollable opponent list in the sidebar; picking one shows
// that matchup on the right:
//   <aside> ... <ul> <li> (radio) <img alt="Lulu"> <span>Lulu</span> <strong>50.87%</strong> <span>2943</span> </li>
// The rows have no links, so the champion is read from the portrait's alt text.
//
// Build page (/lol/champions/<champ>/build/<role>): a "<Champ> Counter" box with "Weak against" / "Strong against"
// tiles, each linking to the matchup:
//   <li><a href="/lol/champions/janna/counters/support?...&target_champion=poppy"> <img alt="Poppy"> 46.64% ...</a></li>
// The champion is read from target_champion. The page's "Synergies" box lists allies and is left alone.
(function (CPF) {
  const LOCALE = String.raw`(?:\/[a-z_-]{2,8})?`;
  const COUNTERS_PAGE = new RegExp(String.raw`^${LOCALE}\/lol\/champions\/[^/]+\/counters`, "i");
  const BUILD_PAGE = new RegExp(String.raw`^${LOCALE}\/lol\/champions\/[^/]+\/build`, "i");
  const MATCHUP_LINKS = 'a[href*="/counters"][href*="target_champion="]';
  const TARGET = /[?&]target_champion=([^&#]+)/;

  function counterRows(root) {
    return Array.from(root.querySelectorAll(":scope aside ul > li img[alt]"), (img) => ({
      element: img.closest("li"),
      champion: img.getAttribute("alt"),
    }));
  }

  const buildRows = (root) => CPF.sites.linkRows(root, MATCHUP_LINKS, TARGET, (a) => a.closest("li"));

  CPF.sites.register({
    id: "opgg",
    name: "OP.GG",
    ...CPF.sites.pages("op.gg", [
      [BUILD_PAGE, buildRows],
      [COUNTERS_PAGE, counterRows],
    ]),
  });
})(CPF);
