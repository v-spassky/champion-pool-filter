// web-ext settings (lint/build/sign). Keeps dev tooling out of the packaged extension.
export default {
  ignoreFiles: [
    "package.json",
    "package-lock.json",
    "eslint.config.js",
    "prettier.config.js",
    "web-ext-config.mjs",
    "README.md",
    "docs",
  ],
};
