import type { NodesMap, ContainedInMap } from '$lib/types.js';
import { buildContainedIn } from '$lib/treeBuilder.js';

/**
 * Global reactive data store — set once from the layout on load.
 * Uses Svelte 5 runes ($state).
 */

let _nodes = $state<NodesMap>({});
let _wordIds = $state<string[]>([]);
let _containedIn = $state<ContainedInMap>({});
let _initialized = $state(false);

export function initData(nodes: NodesMap, wordIds: string[]) {
  if (_initialized) return;
  _nodes = nodes;
  _wordIds = wordIds;
  _containedIn = buildContainedIn(nodes, wordIds);
  _initialized = true;
}

export const data = {
  get nodes() { return _nodes; },
  get wordIds() { return _wordIds; },
  get containedIn() { return _containedIn; },
  get initialized() { return _initialized; }
};
