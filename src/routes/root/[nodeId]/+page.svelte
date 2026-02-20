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

{#if node}
  <div class="tree-area">
    <div class="root-page">
      <button class="back-btn" onclick={() => history.back()}>← back</button>
      <div class="root-hero">
        <span class="root-hero-word">{node.word}</span>
        <LangTag lang={node.lang} />
      </div>
      {#if node.meaning}
        <div class="root-hero-meaning">"{node.meaning}"</div>
      {/if}
      <div class="root-found-label">
        found in {containingWordIds.length} word {containingWordIds.length === 1 ? 'hierarchy' : 'hierarchies'}
      </div>
      {#each containingWordIds as wid}
        {@const wordNode = data.nodes[wid]}
        {@const wordTree = buildTree(wid, data.nodes)}
        {#if wordNode && wordTree}
          <div class="root-section">
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <div class="root-section-title" onclick={() => goto(`/tree/${wid}`)}>
              {wordNode.word}
              <span class="root-section-arrow">open word →</span>
            </div>
            <div class="root-section-tree">
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
        <div class="cmd-hint">no hierarchies found</div>
      {/if}
    </div>
  </div>
{:else if ready}
  <div class="tree-area">
    <div class="empty-state">node not found: {nodeId}</div>
  </div>
{:else}
  <div class="tree-area">
    <div class="empty-state loading-state">
      <span class="loading-dot"></span>
    </div>
  </div>
{/if}

<style>
  .tree-area { flex: 1; min-height: 0; overflow: auto; padding: 12px 24px 24px 12px; }
  .root-page { padding: 2px 0 24px; }
  .empty-state { color: var(--text-muted); padding: 48px 24px; font-size: 12px; }
  .loading-state { display: flex; align-items: center; justify-content: center; padding: 0; }
  .loading-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent);
    animation: pulse 1.2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.1); }
  }
  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: inherit; font-size: 11px; color: var(--text-muted);
    background: transparent; border: none; cursor: pointer;
    padding: 4px 0 12px; transition: color 0.1s;
  }
  .back-btn:hover { color: var(--accent); }
  .root-hero {
    display: flex; align-items: baseline; gap: 10px;
    flex-wrap: wrap; margin-bottom: 4px;
  }
  .root-hero-word { font-size: 20px; font-weight: 600; color: var(--text-primary); }
  .root-hero-meaning { font-size: 12px; color: var(--text-muted); font-style: italic; margin-bottom: 14px; }
  .root-found-label { font-size: 11px; color: var(--text-muted); margin-bottom: 14px; }
  .root-section { border: 1px solid var(--border); border-radius: 6px; margin-bottom: 10px; overflow: hidden; }
  .root-section-title {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 12px; font-size: 12px; font-weight: 600;
    color: var(--accent); background: var(--accent-bg);
    cursor: pointer; border-bottom: 1px solid var(--border);
    transition: opacity 0.1s; user-select: none;
  }
  .root-section-title:hover { opacity: 0.75; }
  .root-section-arrow { color: var(--text-muted); font-weight: 400; margin-left: auto; font-size: 11px; }
  .root-section-tree { padding: 6px 0; }
  .cmd-hint { padding: 20px 18px; font-size: 12px; color: var(--text-muted); text-align: center; }
  .empty-state { color: var(--text-muted); padding: 48px 24px; font-size: 12px; }

  @media (max-width: 640px) {
    .tree-area { overflow-x: hidden; }
  }
</style>
