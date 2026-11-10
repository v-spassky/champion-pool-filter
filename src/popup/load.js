// Loads the shared scripts the content script uses (core + site adapters; not src/content/, which runs on the stats
// pages) in manifest order, then popup.js, so the popup never keeps its own list. async=false keeps them in order.
{
  const { js } = chrome.runtime.getManifest().content_scripts[0];
  const files = [...js.filter((file) => !file.startsWith("src/content/")).map((file) => `/${file}`), "popup.js"];
  for (const file of files) {
    const script = document.createElement("script");
    script.src = file;
    script.async = false;
    document.body.append(script);
  }
}
