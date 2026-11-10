// lolalytics.com adapter.
//
// Counter page (/lol/<champ>/counters/, optionally with a locale prefix like /de/lol/...) shows matchup cards:
//   <div class="flex flex-wrap ...">
//     <span> <div class="... border ..."> <a href="/lol/nami/vs/rakan/build/">
//       <div>Rakan</div> <img alt="Rakan"> ... <div>307 Games</div> </a> </div> </span>
// The whole <span> is the card, so no empty bordered box is left behind. The intro paragraph also contains /vs/
// links (plain text, no portrait); those are skipped by requiring an <img> inside the link. The page header also has
// a champion picker linking to /lol/<champ>/counters/, which is never touched.
(function (CPF) {
  const PAGE = /^(?:\/[a-z_]{2,6})?\/lol\/[^/]+\/counters\/?$/i;
  const VS = /\/lol\/[^/]+\/vs\/([^/]+)\//i;

  const findRows = (root) => CPF.sites.linkRows(root, 'a[href*="/vs/"]:has(img)', VS, (a) => a.closest("span"));

  CPF.sites.register({
    id: "lolalytics",
    name: "Lolalytics",
    ...CPF.sites.pages("lolalytics.com", [[PAGE, findRows]]),
  });
})(CPF);
