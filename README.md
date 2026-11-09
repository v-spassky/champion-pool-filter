# Champion Pool Filter

Browser extension (Chrome / Edge / Firefox, Manifest V3) that hides champions outside your pool from counter lists on
LoL stats sites.

## Supported sites

| Site             | Pages                             | Adapter                          |
| ---------------- | --------------------------------- | -------------------------------- |
| u.gg             | `/lol/champions/<champ>/counter`  | precise (`ugg.js`)               |
| Blitz            | `/lol/champions/<champ>/counters` | precise (`blitz.js`)             |
| Lolalytics       | `/lol/<champ>/counters/`          | precise (`lolalytics.js`)        |
| CounterStats     | `/league-of-legends/<champ>`      | precise (`counterstats.js`)      |
| OP.GG            | `/lol/champions/<champ>/counters` | heuristic (`heuristic-sites.js`) |
| Mobalytics       | `/lol/champions/<champ>/counters` | heuristic                        |
| League of Graphs | `/champions/counters/<champ>`     | heuristic                        |

**Precise** adapters target the site's actual markup. **Heuristic** ones find champion portraits and lift each to its
list row; they skip nav/menus/tooltips, groups smaller than 4, and anything listing (nearly) every champion (champion
pickers). The heuristic was validated against the Blitz, Lolalytics and CounterStats pages, where it found exactly the
same rows as the precise adapters. OP.GG, Mobalytics and League of Graphs block automated downloads, so they haven't
been checked against their real pages — if one misbehaves, write a precise adapter for it.

## Install

1. Open `chrome://extensions` (or `edge://extensions`), enable **Developer mode**.
2. **Load unpacked** → select this folder.
3. Click the extension icon, add the champions you play.

### Firefox (142+)

- **Quick test:** `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `manifest.json`. It is
  removed when Firefox restarts.
- **Permanent:** sign it as an unlisted add-on (free, automated):
  `npx web-ext sign --channel=unlisted --api-key=... --api-secret=...` (keys from
  https://addons.mozilla.org/developers/addon/api/key/), then open the produced `.xpi` in Firefox.
- If nothing gets filtered, check `about:addons` → the extension → **Permissions** and allow access to the stats sites
  and ddragon.leagueoflegends.com.

## Popup options

- **On/off switch** – toggles filtering globally.
- **Champion pool** – type to search (arrow keys + Enter, or click).
- **Hide / Dim** – remove non-pool champions entirely, or just fade them out (default: Dim).
- **Sites** – enable/disable per supported site.

Settings live in `chrome.storage.sync`; pages update live when you change them.

## Layout

```
src/core/namespace.js   shared global (content scripts can't use ES modules)
src/core/champions.js   name normalization + aliases, champion catalog from Riot Data Dragon
src/core/settings.js    settings storage
src/sites/registry.js   adapter registry, interface docs, shared helpers (heuristic finder)
src/sites/*.js          one adapter per site; heuristic-sites.js holds the heuristic ones
src/content/filter.js   site-agnostic engine (applies filter, watches DOM / SPA navigation)
src/popup/              settings UI
icons/                  extension icons (16/32/48/128 px)
```

## Adding a new site

**Quickest:** add an entry (`id`, `name`, `domain`, `page` regex) to `HEURISTIC_SITES` in
`src/sites/heuristic-sites.js`, then do steps 2–3 below.

**Precise:**

1. Create `src/sites/<site>.js` calling `CPF.sites.register({ id, name, matches, findRows })` (see the interface in
   `src/sites/registry.js`). `findRows` just returns `{ element, champion }` pairs — the engine handles everything else.
2. In `manifest.json`, add the site's domain to `content_scripts.matches` and the file to `js` (after `registry.js`,
   before `filter.js`).
3. Add a `<script>` tag for it in `src/popup/popup.html` so it appears in the Sites list.
4. If the site spells a champion unusually, add an entry to `ALIASES` in `src/core/champions.js`.

## Development

Requires Node.js 22+. Run `npm install` once.

- `npm run lint` — runs all checks (the same ones GitHub Actions runs on every push and pull request):
  - `lint:js` — ESLint (strict rules + `eslint-plugin-unicorn`), zero warnings allowed
  - `lint:format` — Prettier formatting check (120-column lines, including Markdown)
  - `lint:ext` — `web-ext lint`, Mozilla's validator for the manifest and extension code
- `npm run fix` — auto-fixes what ESLint can and reformats everything with Prettier.
