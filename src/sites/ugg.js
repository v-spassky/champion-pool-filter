// u.gg adapter.
//
// Counter page (/lol/champions/<champ>/counter) renders three lists
// ("Best Picks vs X", "Worst Picks vs X", "Best Lane Counters vs X").
// Each entry is a row link; the champion is read from its href:
//   <a href="/lol/champions/taric/build"> ... <div class="... font-bold truncate">Taric</div> ... 282 games </a>
// Header/nav links to champion builds are left alone: every list row ends with a sample size ("282 games"), while
// the stat itself varies ("53.19% WR", "+457 GD15").
(function (CPF) {
  const PAGE = /^\/lol\/champions\/[^/]+\/counter/;
  const ROW_HREF = /^\/lol\/champions\/([a-z0-9]+)\/build\/?$/i;

  const isListRow = (a) => /\d\s*games/i.test(a.textContent);
  const findRows = (root) =>
    CPF.sites.linkRows(root, 'a[href^="/lol/champions/"]', ROW_HREF, (a) => (isListRow(a) ? a : null));

  CPF.sites.register({
    id: "ugg",
    name: "u.gg",
    ...CPF.sites.pages("u.gg", [[PAGE, findRows]]),
  });
})(CPF);
