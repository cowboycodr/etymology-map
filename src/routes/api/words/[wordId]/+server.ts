import type { RequestHandler } from './$types.js';
import { nodes, getSubtreeNodes, sliceContainedIn } from '$lib/server/wordStore.js';

export const GET: RequestHandler = ({ params }) => {
  const { wordId } = params;
  if (!nodes[wordId]) return new Response('Not Found', { status: 404 });

  const subtreeNodes = getSubtreeNodes(wordId);

  return Response.json(
    { nodes: subtreeNodes, containedIn: sliceContainedIn(Object.keys(subtreeNodes)) },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
  );
};
