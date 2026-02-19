<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { data } from '$lib/stores/data.svelte.js';
  import { buildGlobalGraphData } from '$lib/graphData.js';
  import GraphView from '$lib/components/GraphView.svelte';
  import GraphPanel from '$lib/components/GraphPanel.svelte';
  import GraphKey from '$lib/components/GraphKey.svelte';

  // Panel word from ?panel= query param
  const panelWordId = $derived($page.url.searchParams.get('panel'));
  const graphData = $derived(
    data.initialized
      ? buildGlobalGraphData(data.nodes, data.wordIds, data.containedIn)
      : null
  );

  function handleNodeClick(nodeId: string, isWord: boolean, _isFocused: boolean) {
    if (!isWord) {
      // Non-word (root) node → show root detail page
      goto(`/root/${nodeId}`);
      return;
    }
    // Word node in global mode → go to local graph + open panel
    goto(`/graph/${nodeId}?panel=${nodeId}`);
  }
</script>

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
</style>
