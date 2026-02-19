import type { NodesMap, ContainedInMap } from './types.js';

export interface GraphNode {
  id: string;
  word: string;
  lang: string;
  originLang?: string;
  meaning: string;
  isWord: boolean;
  isFocused?: boolean;
  isNeighbor?: boolean;
  degree?: number;
  // D3 simulation adds these at runtime:
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  count?: number;
  isTreeEdge?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Build a force-graph dataset where every top-level word is a node,
 * and edges connect words that share at least one ancestor node.
 */
export function buildGlobalGraphData(
  nodes: NodesMap,
  wordIds: string[],
  containedIn: ContainedInMap
): GraphData {
  const graphNodes: GraphNode[] = wordIds.map(id => {
    const parentId = (nodes[id]?.roots || [])[0];
    const originLang = nodes[parentId]?.lang || nodes[id].lang;
    return {
      id,
      word: nodes[id].word,
      lang: nodes[id].lang,
      originLang,
      meaning: nodes[id].meaning || '',
      isWord: true
    };
  });

  const pairCount: Record<string, number> = {};
  for (const [, inWords] of Object.entries(containedIn)) {
    if (inWords.length < 2) continue;
    for (let i = 0; i < inWords.length; i++) {
      for (let j = i + 1; j < inWords.length; j++) {
        const a = inWords[i], b = inWords[j];
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        pairCount[key] = (pairCount[key] || 0) + 1;
      }
    }
  }

  const edges: GraphEdge[] = Object.entries(pairCount).map(([key, count]) => {
    const [source, target] = key.split('|');
    return { source, target, count };
  });

  const deg: Record<string, number> = {};
  for (const { source: s, target: t } of edges) {
    const si = s as string, ti = t as string;
    deg[si] = (deg[si] || 0) + 1;
    deg[ti] = (deg[ti] || 0) + 1;
  }
  for (const n of graphNodes) n.degree = deg[n.id] || 0;

  return { nodes: graphNodes, edges };
}

/**
 * Build a force-graph dataset focused on one word:
 * shows all ancestor nodes + neighboring words that share ancestry.
 */
export function buildLocalGraphData(
  focusedId: string,
  nodes: NodesMap,
  wordIds: string[],
  containedIn: ContainedInMap
): GraphData {
  // Collect all ancestor nodes of the focused word
  const myNodes = new Set<string>();
  function collect(id: string, d = 0) {
    if (myNodes.has(id) || d > 25) return;
    myNodes.add(id);
    (nodes[id]?.roots || []).forEach(r => collect(r, d + 1));
  }
  collect(focusedId);

  // English words that share any ancestor with the focused word
  const neighbors = new Set<string>();
  for (const nid of myNodes) {
    if (nid === focusedId) continue;
    (containedIn[nid] || []).forEach(wid => {
      if (wid !== focusedId && wordIds.includes(wid)) neighbors.add(wid);
    });
  }

  const edgeSeen = new Set<string>();
  const edges: GraphEdge[] = [];
  const addEdge = (s: string, t: string, isTreeEdge: boolean) => {
    const k = `${s}|${t}`;
    if (!edgeSeen.has(k)) { edgeSeen.add(k); edges.push({ source: s, target: t, isTreeEdge }); }
  };

  // Derivation edges within the focused word's ancestor tree
  for (const nid of myNodes) {
    (nodes[nid]?.roots || []).forEach(rid => {
      if (myNodes.has(rid)) addEdge(nid, rid, true);
    });
  }

  // Neighbor → closest shared ancestor (BFS, dashed edge)
  for (const wid of neighbors) {
    const vis = new Set([wid]);
    const q = [wid];
    let found = false;
    while (q.length && !found) {
      const curr = q.shift()!;
      for (const rid of (nodes[curr]?.roots || [])) {
        if (vis.has(rid)) continue;
        vis.add(rid);
        if (myNodes.has(rid)) { addEdge(wid, rid, false); found = true; break; }
        q.push(rid);
      }
    }
  }

  const allIds = new Set([...myNodes, ...neighbors]);
  const graphNodes: GraphNode[] = [...allIds].map(id => ({
    id,
    word: nodes[id]?.word || id,
    lang: nodes[id]?.lang || 'English',
    meaning: nodes[id]?.meaning || '',
    isWord: wordIds.includes(id),
    isFocused: id === focusedId,
    isNeighbor: neighbors.has(id)
  }));

  return { nodes: graphNodes, edges };
}
