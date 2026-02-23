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

<div class="flex-1 overflow-hidden relative flex flex-col min-h-0">
  {#if graphData}
    <div class="absolute top-[13px] right-[14px] text-[10px] tracking-[0.05em] text-text-muted z-5 pointer-events-none">{data.wordIds.length} words</div>
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
    <div class="flex-1 flex items-center justify-center">
      <span class="w-[7px] h-[7px] rounded-full bg-accent animate-pulse-slow"></span>
    </div>
  {/if}
</div>
