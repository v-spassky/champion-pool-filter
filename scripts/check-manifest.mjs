// Checks the parts of manifest.json that must agree with each other and with the site adapters, so adding or
// renaming a site can't silently leave one of them behind. Run by `npm run lint`.
import { readdirSync, readFileSync } from "node:fs";

// Hosts the extension fetches data from; they get host permissions but no content script.
const DATA_ORIGINS = new Set(["https://ddragon.leagueoflegends.com/*"]);

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const [content] = manifest.content_scripts;
const errors = [];

// Every site the content script runs on needs host permissions, and vice versa.
const sitePermissions = manifest.host_permissions.filter((origin) => !DATA_ORIGINS.has(origin));
for (const origin of content.matches) {
  if (!sitePermissions.includes(origin)) {
    errors.push(`${origin} is in content_scripts.matches but not host_permissions`);
  }
}
for (const origin of sitePermissions) {
  if (!content.matches.includes(origin)) {
    errors.push(`${origin} is in host_permissions but not content_scripts.matches`);
  }
}

// Every adapter file is loaded, after registry.js and before the engine.
const adapters = readdirSync("src/sites")
  .filter((file) => file.endsWith(".js") && file !== "registry.js")
  .map((file) => `src/sites/${file}`);
const position = (file) => content.js.indexOf(file);
for (const file of adapters) {
  if (position(file) === -1) errors.push(`${file} is not in content_scripts.js`);
  else if (position(file) < position("src/sites/registry.js")) errors.push(`${file} is loaded before registry.js`);
  else if (position(file) > position("src/content/filter.js")) errors.push(`${file} is loaded after filter.js`);
}
for (const file of content.js) {
  if (file !== "src/sites/registry.js" && file.startsWith("src/sites/") && !adapters.includes(file)) {
    errors.push(`content_scripts.js lists ${file}, which doesn't exist`);
  }
}

// Every adapter's domain is covered by a content script match ("https://op.gg/*", "https://*.op.gg/*", ...).
const matchHosts = content.matches.map((origin) => new URL(origin.replace("*.", "")).hostname);
for (const file of adapters) {
  const domain = /CPF\.sites\.pages\("([^"]+)"/.exec(readFileSync(file, "utf8"))?.[1];
  if (!domain) errors.push(`${file} doesn't declare its domain with CPF.sites.pages("<domain>", ...)`);
  else if (matchHosts.every((host) => host !== domain && !host.endsWith(`.${domain}`))) {
    errors.push(`${file} handles ${domain}, which no content_scripts.matches pattern covers`);
  }
}

if (errors.length > 0) {
  console.error(`manifest.json check failed:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  process.exitCode = 1;
} else {
  process.stdout.write(`manifest.json OK: ${adapters.length} site adapters, ${content.matches.length} site origins.\n`);
}
