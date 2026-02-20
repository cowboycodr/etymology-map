import type { RequestHandler } from './$types.js';
import wordsData from '../../../../static/words.json';

export const GET: RequestHandler = () => {
  return Response.json(wordsData, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
