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

<svelte:head>
  {#if data.manifest[wordId]}
    {@const entry = data.manifest[wordId]}
    <title>{entry.word} – Etymology Map</title>
    <meta name="description" content="Explore the etymology of '{entry.word}' ({entry.lang}) and its connections to related words, showing shared {entry.originLang} roots." />
    <link rel="canonical" href="https://map.kian.im/graph/{wordId}" />
    <meta property="og:url" content="https://map.kian.im/graph/{wordId}" />
    <meta property="og:title" content="{entry.word} – Etymology Map" />
    <meta property="og:description" content="Explore the etymology of '{entry.word}' and its connections to related words." />
  {/if}
</svelte:head>

<div class="flex-1 overflow-hidden relative flex flex-col min-h-0">
  {#if graphData}
    <button class="absolute top-[10px] left-[12px] font-inherit text-xs text-text-muted bg-bg-surface border border-border rounded px-2.5 py-1 cursor-pointer z-5 transition-colors duration-100 hover:text-accent hover:border-accent max-md:px-4 max-md:text-sm" onclick={() => goto('/graph')}>← all words</button>
    <div class="absolute top-[13px] right-[14px] text-[10px] tracking-[0.05em] text-text-muted z-5 pointer-events-none">{data.nodes[wordId]?.word ?? wordId}</div>
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
    <div class="flex-1 flex items-center justify-center">
      <span class="w-[7px] h-[7px] rounded-full bg-accent animate-pulse-slow"></span>
    </div>
  {/if}
</div>
