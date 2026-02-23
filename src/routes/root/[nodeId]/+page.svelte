<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { data, mergeData } from '$lib/stores/data.svelte.js';
  import { buildTree } from '$lib/treeBuilder.js';
  import LangTag from '$lib/components/LangTag.svelte';
  import TreeNode from '$lib/components/TreeNode.svelte';

  const nodeId = $derived($page.params.nodeId);

  // Fetch node bundle (node + all containing-word subtrees) on demand
  $effect(() => {
    const nid = nodeId;
    const key = `node:${nid}`;
    if (data.allLoaded || data.isLoaded(key)) return;
    fetch(`/api/nodes/${nid}`)
      .then(r => r.json())
      .then(json => mergeData(key, json.nodes, json.containedIn, json.containingWordIds ?? []));
  });

  const nodeKey = $derived(`node:${nodeId}`);
  const ready            = $derived(data.allLoaded || data.isLoaded(nodeKey));
  const node             = $derived(ready ? data.nodes[nodeId] : null);
  const containingWordIds = $derived(ready ? (data.containedIn[nodeId] ?? []) : []);
</script>

<svelte:head>
  {#if node}
    <title>{node.word} ({node.lang}) – Etymology Map</title>
    <meta name="description" content="{node.meaning ? `"${node.meaning}" — ` : ''}The {node.lang} root '{node.word}' appears in {containingWordIds.length} word {containingWordIds.length === 1 ? 'hierarchy' : 'hierarchies'}." />
    <link rel="canonical" href="https://map.kian.im/root/{nodeId}" />
    <meta property="og:url" content="https://map.kian.im/root/{nodeId}" />
    <meta property="og:title" content="{node.word} ({node.lang}) – Etymology Map" />
    <meta property="og:description" content="{node.meaning ? `"${node.meaning}" — ` : ''}The {node.lang} root '{node.word}' found in {containingWordIds.length} word {containingWordIds.length === 1 ? 'hierarchy' : 'hierarchies'}." />
  {/if}
</svelte:head>

{#if node}
  <div class="flex-1 min-h-0 overflow-auto p-3 pl-[12px] pb-6 max-md:overflow-x-hidden">
    <div class="py-[2px] pb-6">
      <button class="inline-flex items-center gap-1.5 font-inherit text-xs text-text-muted bg-transparent border-none cursor-pointer py-1 pb-3 transition-colors duration-100 hover:text-accent" onclick={() => history.back()}>← back</button>
      <div class="flex items-baseline gap-2.5 flex-wrap mb-1">
        <span class="text-xl font-semibold text-text-primary">{node.word}</span>
        <LangTag lang={node.lang} />
      </div>
      {#if node.meaning}
        <div class="text-xs text-text-muted italic mb-3.5">"{node.meaning}"</div>
      {/if}
      <div class="text-xs text-text-muted mb-3.5">
        found in {containingWordIds.length} word {containingWordIds.length === 1 ? 'hierarchy' : 'hierarchies'}
      </div>
      {#each containingWordIds as wid}
        {@const wordNode = data.nodes[wid]}
        {@const wordTree = buildTree(wid, data.nodes)}
        {#if wordNode && wordTree}
          <div class="border border-border rounded-md mb-2.5 overflow-hidden">
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <div class="flex items-center gap-2 py-1.5 px-3 text-xs font-semibold text-accent bg-accent-bg cursor-pointer border-b border-border transition-opacity duration-100 select-none hover:opacity-75" onclick={() => goto(`/tree/${wid}`)}>
              {wordNode.word}
              <span class="text-text-muted font-normal text-xs ml-auto">open word →</span>
            </div>
            <div class="py-1.5">
              <TreeNode
                node={wordTree}
                isLast={true}
                ancestorHasMore={[]}
                isRoot={true}
                highlightId={nodeId}
                onNodeClick={(id) => goto(`/root/${id}`)}
              />
            </div>
          </div>
        {/if}
      {/each}
      {#if containingWordIds.length === 0}
        <div class="py-5 px-4.5 text-xs text-text-muted text-center">no hierarchies found</div>
      {/if}
    </div>
  </div>
{:else if ready}
  <div class="flex-1 min-h-0 overflow-auto p-3 pl-[12px] pb-6 max-md:overflow-x-hidden">
    <div class="text-text-muted py-12 px-6 text-xs">node not found: {nodeId}</div>
  </div>
{:else}
  <div class="flex-1 min-h-0 overflow-auto p-3 pl-[12px] pb-6 max-md:overflow-x-hidden">
    <div class="flex items-center justify-center py-0 px-0">
      <span class="w-[7px] h-[7px] rounded-full bg-accent animate-pulse-slow"></span>
    </div>
  </div>
{/if}
