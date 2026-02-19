<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { data } from '$lib/stores/data.svelte.js';
  import { buildLocalGraphData } from '$lib/graphData.js';
  import GraphView from '$lib/components/GraphView.svelte';
  import GraphPanel from '$lib/components/GraphPanel.svelte';
  import GraphKey from '$lib/components/GraphKey.svelte';

  const wordId = $derived($page.params.wordId);
  const panelWordId = $derived($page.url.searchParams.get('panel'));

  const graphData = $derived(
    data.initialized && wordId
      ? buildLocalGraphData(wordId, data.nodes, data.wordIds, data.containedIn)
      : null
  );

  function handleNodeClick(nodeId: string, isWord: boolean, isFocused: boolean) {
    if (!isWord) {
      // Root/non-word node → root detail
      goto(`/root/${nodeId}`);
      return;
    }
    if (isFocused) {
      // Clicking the focused word itself → go to its tree view
      goto(`/tree/${nodeId}`);
      return;
    }
    // Neighbor word → new local graph + open panel
    goto(`/graph/${nodeId}?panel=${nodeId}`);
  }
</script>

<div class="graph-wrapper">
  {#if graphData}
    <button class="graph-back" onclick={() => goto('/graph')}>← all words</button>
    <div class="graph-label">{data.nodes[wordId]?.word ?? wordId}</div>
    <GraphView
      mode="local"
      data={graphData}
      {panelWordId}
      onNodeClick={handleNodeClick}
    />
    {#if panelWordId && data.nodes[panelWordId]}
      <GraphPanel
        wordId={panelWordId}
        onClose={() => goto(`/graph/${wordId}`, { replaceState: true })}
        onWordClick={(wid) => goto(`/tree/${wid}`)}
      />
    {/if}
    <GraphKey />
  {/if}
</div>

<style>
  .graph-wrapper {
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .graph-back {
    position: absolute;
    top: 10px;
    left: 12px;
    font-family: inherit;
    font-size: 11px;
    color: var(--text-muted);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
    z-index: 5;
    transition: color 0.1s, border-color 0.1s;
  }

  .graph-back:hover { color: var(--accent); border-color: var(--accent); }

  .graph-label {
    position: absolute;
    top: 13px;
    right: 14px;
    font-size: 10px;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    z-index: 5;
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .graph-back { padding: 8px 16px; font-size: 13px; }
  }
</style>
