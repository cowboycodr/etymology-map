import type { RequestHandler } from './$types.js';
import { nodes, allWordIds, containedIn } from '$lib/server/wordStore.js';

export const GET: RequestHandler = () => {
  return Response.json(
    { wordIds: allWordIds, nodes, containedIn },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
  );
};
