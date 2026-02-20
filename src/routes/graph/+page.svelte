<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { data, initAllData } from '$lib/stores/data.svelte.js';
  import { buildGlobalGraphData } from '$lib/graphData.js';
  import GraphView from '$lib/components/GraphView.svelte';
  import GraphPanel from '$lib/components/GraphPanel.svelte';
  import GraphKey from '$lib/components/GraphKey.svelte';

  // Graph needs full containedIn to compute shared-ancestry edges
  $effect(() => {
    if (data.allLoaded) return;
    fetch('/api/all')
      .then(r => r.json())
      .then(json => initAllData(json.wordIds, json.nodes, json.containedIn));
  });

  const panelWordId = $derived($page.url.searchParams.get('panel'));
  const graphData = $derived(
    data.allLoaded
      ? buildGlobalGraphData(data.nodes, data.wordIds, data.containedIn)
      : null
  );

  function handleNodeClick(nodeId: string, isWord: boolean, _isFocused: boolean) {
    if (!isWord) {
      goto(`/root/${nodeId}`);
      return;
    }
    goto(`/graph/${nodeId}?panel=${nodeId}`);
  }
</script>

<svelte:head>
  <title>Etymology Map – Visual Word Origins</title>
  <meta name="description" content="Browse {data.wordIds.length || 354} English words as an interactive force-directed graph showing shared etymological roots and linguistic relationships." />
  <link rel="canonical" href="https://map.kian.im/graph" />
  <meta property="og:url" content="https://map.kian.im/graph" />
  <meta property="og:title" content="Etymology Map – Visual Word Origins" />
  <meta property="og:description" content="Browse English words as an interactive graph showing shared etymological roots across Proto-Indo-European, Latin, Greek, and more." />
</svelte:head>

<div class="graph-wrapper">
  {#if graphData}
    <div class="graph-label">{data.wordIds.length} words</div>
    <GraphView
      mode="global"
      data={graphData}
      {panelWordId}
      onNodeClick={handleNodeClick}
    />
    {#if panelWordId && data.nodes[panelWordId]}
      <GraphPanel
        wordId={panelWordId}
        onClose={() => goto('/graph', { replaceState: true })}
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
</style>
