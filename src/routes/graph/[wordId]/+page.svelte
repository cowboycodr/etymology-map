<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { data, initAllData } from '$lib/stores/data.svelte.js';
  import { buildLocalGraphData } from '$lib/graphData.js';
  import GraphView from '$lib/components/GraphView.svelte';
  import GraphPanel from '$lib/components/GraphPanel.svelte';
  import GraphKey from '$lib/components/GraphKey.svelte';

  const wordId = $derived($page.params.wordId);
  const panelWordId = $derived($page.url.searchParams.get('panel'));

  // Local graph also needs full containedIn to find neighbor words
  $effect(() => {
    if (data.allLoaded) return;
    fetch('/api/all')
      .then(r => r.json())
      .then(json => initAllData(json.wordIds, json.nodes, json.containedIn));
  });

  const graphData = $derived(
    data.allLoaded && wordId
      ? buildLocalGraphData(wordId, data.nodes, data.wordIds, data.containedIn)
      : null
  );

  function handleNodeClick(nodeId: string, isWord: boolean, isFocused: boolean) {
    if (!isWord) {
      goto(`/root/${nodeId}`);
      return;
    }
    if (isFocused) {
      goto(`/tree/${nodeId}`);
      return;
    }
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
  {:else}
    <div class="graph-loading">
      <span class="loading-dot"></span>
    </div>
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

  .graph-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent);
    animation: pulse 1.2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.1); }
  }

  @media (max-width: 640px) {
    .graph-back { padding: 8px 16px; font-size: 13px; }
  }
</style>
