// web-ext settings (lint/build/sign). Only the extension itself ships: the manifest, icons and src/. Everything else
// in the repo (tooling, docs, scripts) stays out without having to be listed here.
export default {
  ignoreFiles: ["**", "!manifest.json", "!icons", "!icons/**", "!src", "!src/**"],
};
