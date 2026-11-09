// Champion identity helpers + champion catalog (from Riot Data Dragon).
(function (CPF) {
  // Different sites spell champions differently ("Kai'Sa", "kaisa", "KaiSa",
  // "Nunu & Willump", "nunu"). Everything is compared via this canonical key.
  function normalize(name = "") {
    return String(name ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replaceAll(/[̀-ͯ]/g, "")
      .replaceAll(/[^a-z0-9]/g, "");
  }

  // Alternate spellings/slugs -> canonical key (normalized Data Dragon name).
  // Add entries here when a site uses an unusual slug.
  const ALIASES = {
    monkeyking: "wukong",
    nunu: "nunuwillump",
    renata: "renataglasc",
    jarvan: "jarvaniv",
    mundo: "drmundo",
  };

  function championKey(nameOrSlug) {
    const n = normalize(nameOrSlug);
    return ALIASES[n] || n;
  }

  const CACHE_KEY = "championCatalog";
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  const CACHE_VERSION = 2; // bump when the cached champion shape changes

  // Returns [{ key, name, id, num, icon }] sorted by name.
  //   id:  Data Dragon id, e.g. "MonkeyKing" (used in many image URLs)
  //   num: Riot numeric id, e.g. "62" (used in some image URLs)
  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.json();
  }

  async function loadCatalog() {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const cached = stored[CACHE_KEY];
    if (cached && cached.version === CACHE_VERSION && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.champions;
    }

    try {
      const [version] = await fetchJson("https://ddragon.leagueoflegends.com/api/versions.json");
      const data = await fetchJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
      const champions = Object.values(data.data)
        .map((c) => ({
          key: championKey(c.name),
          name: c.name,
          id: c.id,
          num: c.key,
          icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`,
        }))
        .toSorted((a, b) => a.name.localeCompare(b.name));
      await chrome.storage.local.set({
        [CACHE_KEY]: { version: CACHE_VERSION, fetchedAt: Date.now(), champions },
      });
      return champions;
    } catch (error) {
      console.warn("[CPF] Failed to fetch champion catalog", error);
      return cached ? cached.champions : [];
    }
  }

  // Builds resolve(text) -> canonical key, or null if `text` isn't a known
  // champion. Accepts display names, Data Dragon ids and slugs
  // ("Kai'Sa", "MonkeyKing", "velkoz"). Numeric ids only with { numeric: true },
  // since bare numbers are ambiguous on most pages.
  function createResolver(catalog) {
    const byText = new Map();
    const byNum = new Map();
    for (const c of catalog) {
      byText.set(c.key, c.key);
      byText.set(championKey(c.id), c.key);
      if (c.num) byNum.set(String(c.num), c.key);
    }
    for (const [alias, key] of Object.entries(ALIASES)) {
      const canonical = byText.get(key);
      if (canonical) byText.set(alias, canonical);
    }

    return function resolve(text, { numeric = false } = {}) {
      if (text == null) return null;
      const raw = String(text).trim();
      return numeric && /^\d+$/.test(raw) ? byNum.get(raw) || null : byText.get(championKey(raw)) || null;
    };
  }

  CPF.champions = { normalize, championKey, loadCatalog, createResolver };
})(CPF);
