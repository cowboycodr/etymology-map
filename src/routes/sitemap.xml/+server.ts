import { allWordIds, nodes } from '$lib/server/wordStore.js';
import { env } from '$env/dynamic/public';

export const prerender = true;

const BASE = (env.PUBLIC_BASE_URL ?? 'https://etymology-map.pages.dev').replace(/\/$/, '');

function url(path: string) {
  return `<url><loc>${BASE}${path}</loc></url>`;
}

export function GET() {
  const nodeIds = Object.keys(nodes);

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    url('/graph'),
    ...allWordIds.map(id => url(`/graph/${id}`)),
    ...allWordIds.map(id => url(`/tree/${id}`)),
    ...nodeIds.map(id => url(`/root/${id}`)),
    '</urlset>',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
