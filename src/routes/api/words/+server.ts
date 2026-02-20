import type { RequestHandler } from './$types.js';
import { allWordIds, manifest } from '$lib/server/wordStore.js';

export const GET: RequestHandler = () => {
  return Response.json(
    { wordIds: allWordIds, manifest },
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
  );
};
