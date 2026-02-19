import type { LayoutLoad } from './$types.js';
import type { WordsData } from '$lib/types.js';

export const prerender = true;
export const ssr = false;

export const load: LayoutLoad = async ({ fetch }) => {
  const res = await fetch('/words.json');
  const data: WordsData = await res.json();
  return {
    nodes: data.nodes,
    wordIds: data.words
  };
};
