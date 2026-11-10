// dpm.lol adapter. Two pages:
//
// Build page (/champions/<Champ>/build): the "Matchups as <Champ>" box has "Good against" / "Bad against" tiles.
// It's a Radix tab panel; the "Matchups" tab is #<id>-content-Enemy ("Synergies" is ...-content-Ally, which lists
// allies, so it's left alone). Each tile is a link plus a tooltip button; the champion is read from the link:
//   <div class="flex flex-col gap-4 mb-4">
//     <a href="/champions/Pantheon/build"> <img alt="Pantheon"> +2.6% 2181 </a>
//     <button aria-haspopup="dialog">Average</button>
//   </div>
//
// Matchup page (/champions/<Champ>/matchups?opponent=X): the opponent picker is a Radix popover (rendered only while
// open) with a search box and every champion, one row each:
//   <div role="dialog"> <input placeholder="Search..."> ...
//     <div role="dialog"> <div class="scroll-fade ..."> <div> <div> <img alt="Aatrox"> <span>Aatrox</span> ...
// Filtering it narrows the picker to "<Champ> vs one of my champions". While the user types in the search box the
// picker is left alone, so the site's search can still find any champion.
(function (CPF) {
  const BUILD_PAGE = /^\/champions\/[^/]+\/build\/?$/i;
  const MATCHUP_PAGE = /^\/champions\/[^/]+\/matchups\/?$/i;
  const LINK = /^\/champions\/([^/?#]+)\/build\/?$/i;
  const TILE_LINKS = '[role="tabpanel"][id$="-content-Enemy"] a[href^="/champions/"]';
  const PICKER_NAMES = '[role="dialog"] img[alt] + span';

  const buildRows = (root) => CPF.sites.linkRows(root, TILE_LINKS, LINK, (a) => a.parentElement);

  function isSearching(picker) {
    const search = picker.parentElement?.closest('[role="dialog"]')?.querySelector("input");
    return Boolean(search?.value.trim());
  }

  function pickerRows(root) {
    const rows = [];
    for (const name of root.querySelectorAll(PICKER_NAMES)) {
      const row = name.closest('[role="dialog"] > * > div'); // dialog > scroll list > row wrapper
      if (row && !isSearching(name.closest('[role="dialog"]'))) {
        rows.push({ element: row, champion: name.previousElementSibling.getAttribute("alt") });
      }
    }
    return rows;
  }

  CPF.sites.register({
    id: "dpm",
    name: "DPM.LOL",
    ...CPF.sites.pages("dpm.lol", [
      [MATCHUP_PAGE, pickerRows],
      [BUILD_PAGE, buildRows],
    ]),
  });
})(CPF);
