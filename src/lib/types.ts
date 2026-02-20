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

/** Pre-normalized search entry — computed once at init, reused on every keystroke */
export interface SearchIndexEntry {
  normWord: string;
  normLang: string;
  normMeaning: string;
  normDate: string;
}

export type SearchIndex = Record<string, SearchIndexEntry>;

/** Minimal per-word data for the sidebar (no subtree nodes needed) */
export interface WordManifestEntry {
  word: string;
  lang: string;
  originLang: string; // lang of first parent, for dot color
}

export type WordManifest = Record<string, WordManifestEntry>;
