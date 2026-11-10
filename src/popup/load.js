// Loads the scripts the content script uses (core + site adapters, minus the page engine) in manifest order, then
// popup.js, so adding a site never needs a second script list here. async=false keeps them running in order.
{
  const { js } = chrome.runtime.getManifest().content_scripts[0];
  const files = [...js.filter((file) => !file.endsWith("/filter.js")).map((file) => `/${file}`), "popup.js"];
  for (const file of files) {
    const script = document.createElement("script");
    script.src = file;
    script.async = false;
    document.body.append(script);
  }
}
