/**
 * Maps a language string to a CSS class for color-coding.
 */
export function langClass(lang: string): string {
  const l = lang.toLowerCase();
  if (l.includes('proto-indo') || l === 'pie') return 'lang-pie';
  if (l.includes('phoenician') || l.includes('semitic')) return 'lang-phoenician';
  if (l.includes('slavic') || l.includes('czech') || l.includes('polish') || l.includes('russian')) return 'lang-slavic';
  if (l.includes('iranian') || l.includes('persian') || l.includes('avestan')) return 'lang-iranian';
  if (l.includes('greek')) return 'lang-greek';
  if (l.includes('latin') || l.includes('italian') || l.includes('french') || l.includes('spanish') || l.includes('portuguese')) return 'lang-latin';
  if (l.includes('english')) return 'lang-english';
  if (l.includes('norse') || l.includes('germanic') || l.includes('german') || l.includes('dutch') || l.includes('nordic') || l.includes('gothic') || l.includes('danish') || l.includes('swedish') || l.includes('icelandic') || l.includes('frisian')) return 'lang-norse';
  return 'lang-other';
}

/**
 * Read a CSS custom property value from :root at runtime.
 * Must be called after DOM is ready — used for D3 node fill colors.
 */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Maps a language string to a D3-renderable fill color.
 * Reads CSS vars at call time so light/dark theming works.
 */
export function langFillColor(lang: string): string {
  const l = lang.toLowerCase();
  if (l.includes('proto-indo') || l === 'pie') return cssVar('--c-pie');
  if (l.includes('phoenician') || l.includes('semitic') || l.includes('hebrew')) return cssVar('--c-phoenician');
  if (l.includes('slavic') || l.includes('czech') || l.includes('polish') || l.includes('russian')) return cssVar('--c-slavic');
  if (l.includes('iranian') || l.includes('persian') || l.includes('avestan')) return cssVar('--c-iranian');
  if (l.includes('greek')) return cssVar('--c-greek');
  if (l.includes('latin') || l.includes('italian') || l.includes('french') || l.includes('spanish') || l.includes('portuguese') || l.includes('medieval')) return cssVar('--c-latin');
  if (l.includes('english')) return cssVar('--c-english');
  if (l.includes('norse') || l.includes('germanic') || l.includes('german') || l.includes('dutch') || l.includes('gothic') || l.includes('danish') || l.includes('swedish') || l.includes('icelandic') || l.includes('frisian')) return cssVar('--c-norse');
  return cssVar('--c-other');
}
