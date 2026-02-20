import type { RequestHandler } from './$types.js';
import { nodes, containedIn, getSubtreeNodes, sliceContainedIn } from '$lib/server/wordStore.js';

export const GET: RequestHandler = ({ params }) => {
  const { nodeId } = params;
  if (!nodes[nodeId]) return new Response('Not Found', { status: 404 });

  // Words that contain this node (needed for root page layout)
  const containingWordIds = containedIn[nodeId] ?? [];

  // Bundle: the node itself + every containing word's full subtree
  const bundledNodes = { [nodeId]: nodes[nodeId] };
  for (const wid of containingWordIds) {
    Object.assign(bundledNodes, getSubtreeNodes(wid));
  }

  return Response.json(
    {
      nodes: bundledNodes,
      containedIn: sliceContainedIn(Object.keys(bundledNodes)),
      containingWordIds,
    },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
  );
};
