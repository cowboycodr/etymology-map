<script lang="ts">
  import '../app.css';
  import { initData } from '$lib/stores/data.svelte.js';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ViewTabs from '$lib/components/ViewTabs.svelte';
  import HintBar from '$lib/components/HintBar.svelte';
  import SearchPalette from '$lib/components/SearchPalette.svelte';
  import type { LayoutData } from './$types.js';

  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

  // Initialize synchronously so child components see initialized data on first render.
  // Using $effect would delay until after paint, causing a "loading…" flash.
  initData(data.nodes, data.wordIds);

  let drawerOpen = $state(false);
  let paletteOpen = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      paletteOpen = !paletteOpen;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<SearchPalette bind:open={paletteOpen} />
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="drawer-overlay" class:open={drawerOpen} onclick={() => drawerOpen = false}></div>
<Sidebar bind:open={drawerOpen} />
<div class="main">
  <ViewTabs onToggleDrawer={() => drawerOpen = !drawerOpen} onOpenSearch={() => paletteOpen = true} />
  {@render children()}
  <HintBar />
</div>

<style>
  .drawer-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.52);
    z-index: 40;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
  .drawer-overlay.open { display: block; }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  @media (max-width: 640px) {
    .main { width: 100vw; }
  }
</style>
