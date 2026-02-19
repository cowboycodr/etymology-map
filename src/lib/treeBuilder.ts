import type { NodesMap, ContainedInMap, TreeNode } from './types.js';

/**
 * Expand flat node references into a nested tree for rendering.
 * Uses depth limit (not visited set) so shared PIE roots can appear
 * under multiple ancestors (it's a DAG, fine to expand into a tree).
 */
export function buildTree(id: string, nodes: NodesMap, depth = 0): TreeNode | null {
  if (depth > 25) return null;
  const n = nodes[id];
  if (!n) return null;
  return {
    ...n,
    _id: id,
    roots: (n.roots || [])
      .map(rid => buildTree(rid, nodes, depth + 1))
      .filter((x): x is TreeNode => x !== null)
  };
}

/**
 * Precompute reverse index: nodeId → [wordId, ...]
 * Run once after nodes and wordIds are loaded.
 */
export function buildContainedIn(nodes: NodesMap, wordIds: string[]): ContainedInMap {
  const map: ContainedInMap = {};
  function walk(wid: string, nodeId: string) {
    if (!map[nodeId]) map[nodeId] = [];
    if (map[nodeId].includes(wid)) return;
    map[nodeId].push(wid);
    for (const rid of (nodes[nodeId]?.roots || [])) walk(wid, rid);
  }
  for (const wid of wordIds) walk(wid, wid);
  return map;
}
