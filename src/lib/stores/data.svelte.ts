import type { NodesMap, ContainedInMap, SearchIndex, WordManifest, WordManifestEntry } from '$lib/types.js';
import { buildSearchIndex } from '$lib/searchEngine.js';
import { buildContainedIn } from '$lib/treeBuilder.js';

// ── Manifest — tiny, loaded first by the layout ──────────────────────────────
let _wordIds = $state<string[]>([]);
let _manifest = $state<WordManifest>({});
let _manifestReady = $state(false);

// ── Nodes — accumulates as routes fetch their slices ─────────────────────────
let _nodes = $state<NodesMap>({});
let _containedIn = $state<ContainedInMap>({});

// Track which data slices are loaded. Using a plain Record so Svelte 5
// can track individual key reads with fine-grained reactivity.
let _loaded = $state<Record<string, boolean>>({});

// ── Search index — built only when full dataset is available ─────────────────
let _searchIndex = $state<SearchIndex>({});
let _searchReady = $state(false);

// ─────────────────────────────────────────────────────────────────────────────

export function initManifest(wordIds: string[], manifest: WordManifest) {
  if (_manifestReady) return;
  _wordIds = wordIds;
  _manifest = manifest;
  _manifestReady = true;
}

/**
 * Merge a slice of node/containedIn data into the store.
 * `key`       — unique identifier for this slice (wordId, `node:${nodeId}`, etc.)
 * `extraKeys` — additional keys to mark loaded (e.g. containingWordIds covered
 *               by a node bundle, so the tree pages skip redundant fetches)
 */
export function mergeData(
  key: string,
  nodes: NodesMap,
  containedIn: ContainedInMap,
  extraKeys: string[] = []
) {
  if (_loaded[key]) return;
  Object.assign(_nodes, nodes);
  Object.assign(_containedIn, containedIn);
  _loaded[key] = true;
  for (const k of extraKeys) _loaded[k] = true;
}

/**
 * Initialise everything client-side from the raw words.json payload.
 * Used as a fallback when the API Worker is not available (e.g. vite preview).
 */
export function initFromWordsJson(nodes: NodesMap, wordIds: string[]) {
  if (_loaded['__all__']) return;
  const containedIn = buildContainedIn(nodes, wordIds);
  // Build manifest entries inline
  const manifest: WordManifest = {};
  for (const id of wordIds) {
    const node = nodes[id];
    const parentId = (node.roots as string[] | undefined)?.[0];
    const originLang = (parentId && nodes[parentId]?.lang) || node.lang;
    manifest[id] = { word: node.word, lang: node.lang, originLang };
  }
  _wordIds = wordIds;
  _manifest = manifest;
  _manifestReady = true;
  _nodes = nodes;
  _containedIn = containedIn;
  _searchIndex = buildSearchIndex(nodes, containedIn);
  _searchReady = true;
  _loaded['__all__'] = true;
}

/**
 * Load the complete dataset (graph views + search).
 * Replaces partial node data with the authoritative full set.
 */
export function initAllData(wordIds: string[], nodes: NodesMap, containedIn: ContainedInMap) {
  if (_loaded['__all__']) return;
  _wordIds = wordIds;
  _nodes = nodes;
  _containedIn = containedIn;
  _searchIndex = buildSearchIndex(nodes, containedIn);
  _searchReady = true;
  _loaded['__all__'] = true;
}

export const data = {
  // Manifest (always available after layout mount)
  get wordIds()      { return _wordIds; },
  get manifest()     { return _manifest; },
  get manifestReady(){ return _manifestReady; },

  // Accumulated node data
  get nodes()        { return _nodes; },
  get containedIn()  { return _containedIn; },

  // Search
  get searchIndex()  { return _searchIndex; },
  get searchReady()  { return _searchReady; },

  // Full-data flag
  get allLoaded()    { return Boolean(_loaded['__all__']); },

  /** Returns true once the named slice has been merged into the store. */
  isLoaded: (key: string) => Boolean(_loaded[key]),

  // Backward-compat alias — true once manifest is ready
  get initialized()  { return _manifestReady; },
};
