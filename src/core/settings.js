// User settings persisted in chrome.storage.sync (follows the user's browser profile).
(function (CPF) {
  const KEY = "settings";

  const DEFAULTS = {
    enabled: true,
    // "hide": remove non-pool champions; "dim": keep them but fade them out.
    mode: "dim",
    // Canonical champion keys (see CPF.champions.championKey).
    pool: [],
    // Per-site on/off switch, keyed by adapter id; read it through isSiteEnabled().
    sites: {},
  };

  // Sites are on unless the user switched them off (so newly added sites start enabled).
  const isSiteEnabled = (settings, siteId) => settings.sites[siteId] !== false;

  const withDefaults = (stored) => ({ ...DEFAULTS, ...stored });

  async function get() {
    const items = await chrome.storage.sync.get(KEY);
    return withDefaults(items[KEY]);
  }

  async function update(patch) {
    const next = { ...(await get()), ...patch };
    await chrome.storage.sync.set({ [KEY]: next });
    return next;
  }

  function onChange(callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && Object.hasOwn(changes, KEY)) callback(withDefaults(changes[KEY].newValue));
    });
  }

  CPF.settings = { get, update, onChange, isSiteEnabled };
})(CPF);
