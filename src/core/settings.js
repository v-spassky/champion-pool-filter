// User settings persisted in chrome.storage.sync (follows the user's browser profile).
(function (CPF) {
  const KEY = "settings";

  const DEFAULTS = {
    enabled: true,
    // "hide": remove non-pool champions; "dim": keep them but fade them out.
    mode: "dim",
    // Canonical champion keys (see CPF.champions.championKey).
    pool: [],
    // Per-site on/off switch, keyed by adapter id. Missing = enabled.
    sites: {},
  };

  async function get() {
    const items = await chrome.storage.sync.get(KEY);
    const stored = items[KEY] || {};
    return { ...DEFAULTS, ...stored, sites: { ...DEFAULTS.sites, ...stored.sites } };
  }

  async function update(patch) {
    const next = { ...(await get()), ...patch };
    await chrome.storage.sync.set({ [KEY]: next });
    return next;
  }

  function onChange(callback) {
    chrome.storage.onChanged.addListener(async (changes, area) => {
      if (area === "sync" && Object.hasOwn(changes, KEY)) callback(await get());
    });
  }

  CPF.settings = { DEFAULTS, get, update, onChange };
})(CPF);
