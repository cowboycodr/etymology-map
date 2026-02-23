<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { data, mergeData } from '$lib/stores/data.svelte.js';
  import { buildTree } from '$lib/treeBuilder.js';
  import LangTag from '$lib/components/LangTag.svelte';
  import TreeNode from '$lib/components/TreeNode.svelte';
  import type { TreeNode as TreeNodeType } from '$lib/types.js';

  const wordId = $derived($page.params.wordId);

  // Fetch this word's subtree on mount and on wordId change
  $effect(() => {
    const wid = wordId;
    if (data.allLoaded || data.isLoaded(wid)) return;
    fetch(`/api/words/${wid}`)
      .then(r => r.json())
      .then(json => mergeData(wid, json.nodes, json.containedIn));
  });

  const ready = $derived(data.allLoaded || data.isLoaded(wordId));
  const node  = $derived(ready ? data.nodes[wordId] : null);
  const tree  = $derived(node  ? buildTree(wordId, data.nodes) : null);

  // Vim cursor: track selected nodeId
  let selectedId = $state<string | null>(null);

  // Reset cursor when wordId changes
  $effect(() => {
    wordId; // track
    selectedId = null;
  });

  // Collect all visible nodeIds in DOM order (for j/k navigation)
  function collectIds(t: TreeNodeType | null): string[] {
    if (!t) return [];
    return [t._id, ...t.roots.flatMap(c => collectIds(c))];
  }
  const allIds = $derived(tree ? collectIds(tree) : []);

  function handleKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.metaKey || e.ctrlKey) return;

    const ids = allIds;
    const idx = selectedId ? ids.indexOf(selectedId) : -1;

    switch (e.key) {
      case 'j': case 'ArrowDown':
        e.preventDefault();
        selectedId = ids[Math.min(idx < 0 ? 0 : idx + 1, ids.length - 1)] ?? null;
        scrollSelected();
        break;
      case 'k': case 'ArrowUp':
        e.preventDefault();
        selectedId = ids[Math.max(0, idx <= 0 ? 0 : idx - 1)] ?? null;
        scrollSelected();
        break;
      case 'g':
        if (!pendingG) {
          pendingG = true;
          setTimeout(() => { pendingG = false; }, 400);
        } else {
          pendingG = false;
          selectedId = ids[0] ?? null;
          scrollSelected();
        }
        break;
      case 'G':
        e.preventDefault();
        selectedId = ids[ids.length - 1] ?? null;
        scrollSelected();
        break;
      case 'h': case 'ArrowLeft':
        e.preventDefault();
        if (selectedId) {
          const parentId = findParent(tree, selectedId);
          if (parentId) selectedId = parentId;
        }
        break;
      case 'l': case 'ArrowRight':
        e.preventDefault();
        if (selectedId) {
          const childId = findFirstChild(tree, selectedId);
          if (childId) selectedId = childId;
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedId) goto(`/root/${selectedId}`);
        break;
      case 'Escape':
        e.preventDefault();
        goto('/tree');
        break;
    }
  }

  let pendingG = false;

  function scrollSelected() {
    if (!selectedId) return;
    setTimeout(() => {
      document.querySelector(`[data-nav-id="${selectedId}"]`)?.closest('.node-row')?.scrollIntoView({ block: 'nearest' });
    }, 0);
  }

  function findParent(t: TreeNodeType | null, targetId: string, parent: string | null = null): string | null {
    if (!t) return null;
    if (t._id === targetId) return parent;
    for (const child of t.roots) {
      const found = findParent(child, targetId, t._id);
      if (found !== null) return found;
    }
    return null;
  }

  function findFirstChild(t: TreeNodeType | null, targetId: string): string | null {
    if (!t) return null;
    if (t._id === targetId) return t.roots[0]?._id ?? null;
    for (const child of t.roots) {
      const found = findFirstChild(child, targetId);
      if (found !== null) return found;
    }
    return null;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  {#if node}
    <title>{node.word} Etymology Tree – Etymology Map</title>
    <meta name="description" content="{node.meaning ? `"${node.meaning}" — ` : ''}Trace the full etymology tree of '{node.word}' ({node.lang}) back through its historical roots." />
    <link rel="canonical" href="https://map.kian.im/tree/{wordId}" />
    <meta property="og:url" content="https://map.kian.im/tree/{wordId}" />
    <meta property="og:title" content="{node.word} Etymology Tree – Etymology Map" />
    <meta property="og:description" content="{node.meaning ? `"${node.meaning}" — ` : ''}Full etymology tree for '{node.word}' ({node.lang})." />
  {:else if data.manifest[wordId]}
    {@const entry = data.manifest[wordId]}
    <title>{entry.word} Etymology Tree – Etymology Map</title>
    <link rel="canonical" href="https://map.kian.im/tree/{wordId}" />
  {/if}
</svelte:head>

{#if node && tree}
  <div class="flex-1 min-h-0 overflow-auto p-3 pl-[12px] pb-6 max-md:overflow-x-hidden">
    <div class="py-[2px] pb-6">
      <div class="flex items-baseline gap-2.5 flex-wrap mb-1">
        <span class="text-xl font-semibold text-text-primary">{node.word}</span>
        <LangTag lang={node.lang} />
        {#if node.date}<span class="text-xs text-text-muted opacity-70">{node.date}</span>{/if}
      </div>
      {#if node.meaning}
        <div class="text-xs text-text-muted italic mb-3.5">"{node.meaning}"</div>
      {/if}
      <div class="mt-2.5">
        <TreeNode
          node={tree}
          isLast={true}
          ancestorHasMore={[]}
          isRoot={true}
          {selectedId}
          onNodeClick={(id) => goto(`/root/${id}`)}
          onRowClick={(id) => { selectedId = id; }}
        />
      </div>
    </div>
  </div>
{:else if ready}
  <div class="flex-1 min-h-0 overflow-auto p-3 pl-[12px] pb-6 max-md:overflow-x-hidden">
    <div class="text-text-muted py-12 px-6 text-xs">word not found: {wordId}</div>
  </div>
{:else}
  <div class="flex-1 min-h-0 overflow-auto p-3 pl-[12px] pb-6 max-md:overflow-x-hidden">
    <div class="flex items-center justify-center py-0 px-0">
      <span class="w-[7px] h-[7px] rounded-full bg-accent animate-pulse-slow"></span>
    </div>
  </div>
{/if}
