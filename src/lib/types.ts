export interface EtymNode {
  word: string;
  lang: string;
  meaning?: string;
  date?: string;
  roots?: string[]; // IDs of parent/ancestor nodes
}

/** EtymNode with its own ID and expanded roots for tree rendering */
export interface TreeNode extends EtymNode {
  _id: string;
  roots: TreeNode[];
}

/** Flat map of all nodes by ID */
export type NodesMap = Record<string, EtymNode>;

/** nodeId → list of top-level word IDs that contain it */
export type ContainedInMap = Record<string, string[]>;

export interface SearchResult {
  nodeId: string;
  node: EtymNode;
  inWords: string[];
  score: number;
}

export interface WordsData {
  nodes: NodesMap;
  words: string[]; // ordered list of top-level word node IDs
}
