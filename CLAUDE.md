# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (vite dev)
npm run build    # Production build — always run this to verify before reporting done
npm run preview  # Preview built output (note: API routes don't run here — see below)
```

No test runner is configured.

## Architecture

**Stack**: SvelteKit 5 + Svelte 5 runes + TailwindCSS v4 + D3 v7 + TypeScript
**Adapter**: `@sveltejs/adapter-cloudflare` — deploys as a Cloudflare Worker
**Routing**: `prerender = true`, `ssr = false` (SPA, client-side only)

### Data

`static/words.json` is the source of truth: a flat `nodes` map (1200+ etymological nodes, each with `word`, `lang`, `meaning?`, `date?`, `roots?: string[]`) and a `words` array of top-level English word IDs.

### Loading pipeline

1. **`src/lib/server/wordStore.ts`** — server-only module imported by API endpoints. Bundles `words.json` once at Worker startup, pre-computes `containedIn` (reverse index: nodeId → wordIds) and the sidebar `manifest`.
2. **API endpoints** (`src/routes/api/`) — four endpoints serve data slices with 1h cache headers:
   - `/api/words` → manifest + wordIds (sidebar)
   - `/api/words/[wordId]` → subtree nodes for one word
   - `/api/nodes/[nodeId]` → node + all containing-word subtrees
   - `/api/all` → full dataset (for graph views and search)
3. **`src/lib/stores/data.svelte.ts`** — central Svelte 5 `$state` store. The layout fetches `/api/words` on mount and calls `initManifest()`; route pages call `mergeData()` or `initAllData()` in `$effect` as needed. If the API is unavailable (e.g. `vite preview`), the layout falls back to fetching `/words.json` directly and calling `initFromWordsJson()`, which computes everything client-side.
4. **`data.isLoaded(key)`** / **`data.allLoaded`** — guard all per-route `$effect` fetches to avoid redundant requests.

### Key libraries

- **`src/lib/treeBuilder.ts`** — `buildTree(id, nodes)` recursively expands a flat node into a nested `TreeNode`; `buildContainedIn(nodes, wordIds)` builds the reverse index.
- **`src/lib/graphData.ts`** — `buildGlobalGraphData()` creates force-graph nodes/edges for all words; `buildLocalGraphData()` creates a focused subgraph for one word + neighbors.
- **`src/lib/searchEngine.ts`** — builds a normalized search index, scores results with exact/prefix/contains/fuzzy (Levenshtein) matching across word/lang/meaning/date fields.

### Routes

| Route | Data fetched |
|-------|-------------|
| `/graph` | `/api/all` |
| `/graph/[wordId]` | `/api/all` |
| `/tree/[wordId]` | `/api/words/[wordId]` |
| `/root/[nodeId]` | `/api/nodes/[nodeId]` |

### Critical gotchas

- **`vite preview` does not run the Cloudflare Worker** — API routes return HTML fallback. The layout handles this with a try/catch fallback to `/words.json`.
- **Recursive Svelte 5 components require an explicit self-import**: `import TreeNode from './TreeNode.svelte'` inside `TreeNode.svelte` itself. Svelte 5 does not allow implicit self-reference.
- **All D3 graph colors use `cssVar('--varname')` at render time** — never hardcode hex values in D3 code; light/dark theming depends on this.
- **Graph text labels** use CSS classes `glt-focused`, `glt-word`, `glt-muted` (defined in `app.css`) — fill is driven by CSS, not D3 `attr('fill', ...)`.
- **`--row-h: 26px`** and **`--guide-w: 20px`** are the tree layout tokens. Guide line connectors are positioned at `calc(var(--row-h) / 2)` — keep this in mind when changing row height.
- **`lib/server/`** is server-only (Cloudflare Worker context). Never import from it in client code.
