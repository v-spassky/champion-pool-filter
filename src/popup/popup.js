(async function () {
  const { championKey, normalize, loadCatalog } = CPF.champions;
  const $ = (id) => document.querySelector(`#${CSS.escape(id)}`);

  let settings = await CPF.settings.get();
  const catalog = await loadCatalog();
  const byKey = new Map(catalog.map((c) => [c.key, c]));
  let activeIndex = 0;

  async function save(patch) {
    settings = await CPF.settings.update(patch);
    render();
  }

  function addChampion(key) {
    if (!settings.pool.includes(key)) save({ pool: [...settings.pool, key] });
    $("search").value = "";
    renderSuggestions();
    $("search").focus();
  }

  function removeChampion(key) {
    save({ pool: settings.pool.filter((k) => k !== key) });
  }

  function iconEl(champ) {
    const img = document.createElement("img");
    img.className = "icon";
    img.alt = "";
    if (champ && champ.icon) img.src = champ.icon;
    return img;
  }

  function renderPool() {
    const list = $("pool");
    list.replaceChildren();
    const sorted = settings.pool.toSorted((a, b) => (byKey.get(a)?.name || a).localeCompare(byKey.get(b)?.name || b));
    for (const key of sorted) {
      const champ = byKey.get(key);
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = champ ? champ.name : key;
      const remove = document.createElement("button");
      remove.textContent = "×";
      remove.title = "Remove";
      remove.addEventListener("click", () => removeChampion(key));
      li.append(iconEl(champ), name, remove);
      list.append(li);
    }
    const n = settings.pool.length;
    $("pool-count").textContent = `${n} champion${n === 1 ? "" : "s"}`;
    $("empty").hidden = n > 0;
    $("clear").hidden = n === 0;
  }

  function matchingChampions() {
    const q = normalize($("search").value);
    return q
      ? catalog
          .filter((c) => !settings.pool.includes(c.key) && (c.key.includes(q) || normalize(c.id).includes(q)))
          .toSorted((a, b) => Number(b.key.startsWith(q)) - Number(a.key.startsWith(q)))
          .slice(0, 8)
      : [];
  }

  function renderSuggestions() {
    const list = $("suggestions");
    const matches = matchingChampions();
    list.replaceChildren();
    list.hidden = matches.length === 0;
    activeIndex = Math.min(activeIndex, Math.max(matches.length - 1, 0));
    for (const [i, champ] of matches.entries()) {
      const li = document.createElement("li");
      li.classList.toggle("active", i === activeIndex);
      const name = document.createElement("span");
      name.textContent = champ.name;
      li.append(iconEl(champ), name);
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        addChampion(champ.key);
      });
      list.append(li);
    }
    return matches;
  }

  function renderSites() {
    const list = $("sites");
    list.replaceChildren();
    for (const site of CPF.sites.all()) {
      const li = document.createElement("li");
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = settings.sites[site.id] !== false;
      cb.addEventListener("change", () => save({ sites: { ...settings.sites, [site.id]: cb.checked } }));
      label.append(cb, site.name);
      li.append(label);
      list.append(li);
    }
  }

  function render() {
    $("enabled").checked = settings.enabled;
    document.querySelector(`input[name="mode"][value="${CSS.escape(settings.mode)}"]`).checked = true;
    renderPool();
    renderSites();
  }

  $("enabled").addEventListener("change", (e) => save({ enabled: e.target.checked }));
  for (const radio of document.querySelectorAll('input[name="mode"]')) {
    radio.addEventListener("change", (e) => save({ mode: e.target.value }));
  }
  $("clear").addEventListener("click", () => save({ pool: [] }));

  $("search").addEventListener("input", () => {
    activeIndex = 0;
    renderSuggestions();
  });
  $("search").addEventListener("blur", () => ($("suggestions").hidden = true));
  $("search").addEventListener("focus", renderSuggestions);
  function moveSelection(step) {
    const matches = matchingChampions();
    if (matches.length === 0) return;
    activeIndex = (activeIndex + step + matches.length) % matches.length;
    renderSuggestions();
  }

  function pickSelection() {
    const pick = matchingChampions()[activeIndex];
    const typed = $("search").value.trim();
    if (pick) addChampion(pick.key);
    // Fallback when the catalog couldn't load: accept the typed name as-is.
    else if (typed && catalog.length === 0) addChampion(championKey(typed));
  }

  $("search").addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        moveSelection(e.key === "ArrowDown" ? 1 : -1);
        break;
      }
      case "Enter": {
        pickSelection();
        break;
      }
      case "Escape": {
        $("suggestions").hidden = true;
        break;
      }
      default:
    }
  });

  // Site access. Browsers (Firefox especially) may withhold host permissions until the user grants them;
  // without them the content scripts never run. The origins come from the manifest so they can't drift.
  const SITE_ORIGINS = chrome.runtime.getManifest().content_scripts.flatMap((script) => script.matches);

  async function renderAccess() {
    const hasAccess = await chrome.permissions.contains({ origins: SITE_ORIGINS });
    $("access").hidden = hasAccess;
  }

  $("grant").addEventListener("click", async () => {
    // Must be the first call in the click handler: browsers only allow permission prompts during a user gesture.
    const granted = await chrome.permissions.request({ origins: SITE_ORIGINS });
    $("granted").hidden = !granted;
    await renderAccess();
  });
  chrome.permissions.onAdded.addListener(renderAccess);
  chrome.permissions.onRemoved.addListener(renderAccess);

  render();
  await renderAccess();
  $("search").focus();
})();
