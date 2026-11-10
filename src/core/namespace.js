// Shared global namespace. Content scripts can't use ES modules, so every script attaches its pieces to
// `CPF`. Load order is the manifest's content_scripts "js" list (the popup loads the same list, see popup/load.js).
// eslint-disable-next-line unicorn/no-global-object-property-assignment -- creating the shared namespace is the point
globalThis.CPF ??= {};
