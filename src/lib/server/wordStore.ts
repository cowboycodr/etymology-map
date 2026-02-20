/**
 * Server-only module — imported by API endpoints.
 * words.json is bundled once here; all endpoints share these computed values.
 */
import rawData from '../../../static/words.json';
import { buildContainedIn } from '$lib/treeBuilder.js';
import type { NodesMap, ContainedInMap, WordManifest, WordManifestEntry } from '$lib/types.js';

const raw = rawData as unknown as { nodes: NodesMap; words: string[] };

export const nodes: NodesMap = raw.nodes;
export const allWordIds: string[] = raw.words;
export const containedIn: ContainedInMap = buildContainedIn(nodes, allWordIds);

/** Thin manifest for the sidebar — word/lang/originLang only, no subtree. */
export const manifest: WordManifest = Object.fromEntries(
  allWordIds.map(id => {
    const node = nodes[id];
    const parentId = (node.roots as string[] | undefined)?.[0];
    const originLang = (parentId && nodes[parentId]?.lang) || node.lang;
    return [id, { word: node.word, lang: node.lang, originLang } satisfies WordManifestEntry];
  })
);

/** All nodes reachable from `wordId` (the word itself + all ancestors). */
export function getSubtreeNodes(wordId: string): NodesMap {
  const result: NodesMap = {};
  function collect(id: string, depth = 0) {
    if (result[id] || depth > 25 || !nodes[id]) return;
    result[id] = nodes[id];
    for (const rid of (nodes[id].roots as string[] | undefined) ?? []) collect(rid, depth + 1);
  }
  collect(wordId);
  return result;
}

/** containedIn slice for just the given set of node IDs (pre-computed from full dataset). */
export function sliceContainedIn(nodeIds: Iterable<string>): ContainedInMap {
  const result: ContainedInMap = {};
  for (const id of nodeIds) {
    if (containedIn[id]) result[id] = containedIn[id];
  }
  return result;
}
