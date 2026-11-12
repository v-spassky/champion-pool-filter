// Loads the shared scripts the content script uses (core + site adapters; not src/content/, which runs on the stats
// pages) in manifest order, then popup.js, so the popup never keeps its own list. async=false keeps them in order.
{
  // Chrome returns manifest paths as written ("src/core/x.js"), Firefox as full extension URLs
  // ("moz-extension://<id>/src/core/x.js"); resolving against the extension root handles both.
  const root = chrome.runtime.getURL("/");
  const urls = chrome.runtime.getManifest().content_scripts[0].js.map((file) => new URL(file, root));
  const files = [...urls.filter((url) => !url.pathname.startsWith("/src/content/")).map((url) => url.href), "popup.js"];
  for (const file of files) {
    const script = document.createElement("script");
    script.src = file;
    script.async = false;
    document.body.append(script);
  }
}
