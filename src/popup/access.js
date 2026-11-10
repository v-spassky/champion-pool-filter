// Site-access banner. Browsers (Firefox especially) may withhold host permissions until the user grants them;
// without them the content scripts never run. The origins come from the manifest so they can't drift.
{
  const SITE_ORIGINS = chrome.runtime.getManifest().content_scripts.flatMap((script) => script.matches);

  const renderAccess = async () => {
    document.querySelector("#access").hidden = await chrome.permissions.contains({ origins: SITE_ORIGINS });
  };

  document.querySelector("#grant").addEventListener("click", async () => {
    // Must be the first call in the click handler: browsers only allow permission prompts during a user gesture.
    const granted = await chrome.permissions.request({ origins: SITE_ORIGINS });
    document.querySelector("#granted").hidden = !granted;
    await renderAccess();
  });
  chrome.permissions.onAdded.addListener(renderAccess);
  chrome.permissions.onRemoved.addListener(renderAccess);
  renderAccess();
}
