import type { NodesMap, ContainedInMap, SearchResult } from './types.js';

// Aliases so users can type "nordic", "pie", "greek", "viking", etc.
const LANG_ALIASES: Record<string, string[]> = {
  'pie':                 ['proto-indo-european'],
  'proto indo european': ['proto-indo-european'],
  'root':                ['proto-indo-european'],
  'roots':               ['proto-indo-european'],
  'pib':                 ['proto-indo-european'],
  'greek':               ['greek'],
  'hellenic':            ['greek'],
  'hellenistic':         ['greek'],
  'attic':               ['greek'],
  'latin':               ['latin'],
  'romance':             ['latin', 'italian', 'french', 'spanish', 'portuguese'],
  'classical':           ['latin', 'classical'],
  'roman':               ['latin'],
  'norse':               ['norse'],
  'nordic':              ['norse'],
  'viking':              ['norse'],
  'germanic':            ['germanic', 'norse', 'german'],
  'german':              ['german', 'germanic'],
  'dutch':               ['dutch', 'germanic'],
  'scandinavian':        ['norse'],
  'slavic':              ['slavic', 'church slavonic', 'czech'],
  'czech':               ['czech'],
  'russian':             ['russian', 'slavic'],
  'iranian':             ['iranian'],
  'persian':             ['persian', 'iranian', 'avestan'],
  'avestan':             ['avestan', 'iranian'],
  'zoroastrian':         ['avestan', 'iranian'],
  'phoenician':          ['phoenician'],
  'semitic':             ['phoenician', 'semitic', 'hebrew', 'aramaic'],
  'hebrew':              ['hebrew', 'phoenician'],
  'english':             ['english'],
  'old english':         ['old english', 'english'],
  'middle english':      ['middle english', 'english'],
  'anglo':               ['english', 'anglo'],
  'french':              ['french'],
  'old french':          ['old french', 'french'],
  'italian':             ['italian'],
};

/** Normalise a string: lowercase, strip PIE special chars, strip diacritics */
export function norm(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[*]/g, '')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, d => String(d.codePointAt(0)! - 0x2080))
    .replace(/[ʰʷʸʲ]/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/[()[\]]/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein distance, bails early past `cap` */
export function editDist(a: string, b: string, cap = 3): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = a[i - 1] === b[j - 1] ? row[j - 1] : 1 + Math.min(row[j - 1], row[j], prev);
      row[j - 1] = prev;
      prev = tmp;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

/** Score a single normalised token against a normalised target. Returns 0 if no match. */
export function scoreToken(rawToken: string, rawTarget: string): number {
  const t = norm(rawToken);
  const v = norm(rawTarget);
  if (!t || !v) return 0;

  if (v === t) return 100;
  if (v.startsWith(t)) return 80;
  if (v.includes(t)) return 60;

  const aliases = LANG_ALIASES[t] || [];
  for (const alias of aliases) {
    if (v.includes(alias)) return 55;
  }

  for (const word of v.split(' ')) {
    if (word.length < 3 || t.length < 3) continue;
    const threshold = t.length <= 4 ? 1 : 2;
    const d = editDist(t, word, threshold);
    if (d <= threshold) return 35 - d * 8;
  }

  return 0;
}

/**
 * Score every node in NODES against the query (flat iteration, no tree walk).
 * Tokens are AND-ed: every token must match at least one field.
 */
export function searchAllNodes(
  query: string,
  nodes: NodesMap,
  containedIn: ContainedInMap
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];

  for (const [nodeId, node] of Object.entries(nodes)) {
    const inWords = containedIn[nodeId];
    if (!inWords || !inWords.length) continue;

    let total = 0;
    for (const token of tokens) {
      const best = Math.max(
        scoreToken(token, node.word),
        scoreToken(token, node.lang)    * 0.85,
        scoreToken(token, node.meaning ?? '') * 0.55,
        scoreToken(token, node.date ?? '')    * 0.25,
      );
      if (best === 0) { total = -1; break; }
      total += best;
    }

    if (total > 0) results.push({ nodeId, node, inWords, score: total });
  }

  return results.sort((a, b) => b.score - a.score);
}

/** Highlight all token matches inside text, returning safe HTML */
export function hlMatch(text: string, query: string): string {
  const esc = (s: string) =>
    String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  if (!query) return esc(text);
  const tokens = query.trim().split(/\s+/).filter(Boolean);

  const lower = text.toLowerCase();
  const ranges: { s: number; e: number }[] = [];
  for (const token of tokens) {
    const t = norm(token);
    if (!t) continue;
    let i = 0;
    while ((i = lower.indexOf(t, i)) !== -1) { ranges.push({ s: i, e: i + t.length }); i++; }
  }
  if (!ranges.length) return esc(text);

  ranges.sort((a, b) => a.s - b.s);
  const merged: { s: number; e: number }[] = [];
  for (const r of ranges) {
    if (merged.length && r.s <= merged[merged.length - 1].e) {
      merged[merged.length - 1].e = Math.max(merged[merged.length - 1].e, r.e);
    } else {
      merged.push({ ...r });
    }
  }

  let out = '', pos = 0;
  for (const { s, e } of merged) {
    out += esc(text.slice(pos, s)) + `<mark>${esc(text.slice(s, e))}</mark>`;
    pos = e;
  }
  return out + esc(text.slice(pos));
}
