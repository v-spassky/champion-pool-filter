/**
@type {import("prettier").Config}
*/
export default {
  printWidth: 120,
  // Wrap Markdown prose at printWidth too, so .md files follow the same 120-column limit.
  proseWrap: "always",
  // Explicit (these are Prettier's defaults) so the style doesn't drift across Prettier releases.
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  endOfLine: "lf",
};
