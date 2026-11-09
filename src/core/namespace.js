// Shared global namespace. Content scripts can't use ES modules, so every script attaches its pieces to
// `CPF`. Load order is defined in manifest.json (content scripts) and popup.html (popup).
// eslint-disable-next-line unicorn/no-global-object-property-assignment -- creating the shared namespace is the point
globalThis.CPF ??= {};
