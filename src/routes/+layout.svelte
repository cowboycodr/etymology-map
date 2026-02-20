<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { initData, data } from '$lib/stores/data.svelte.js';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ViewTabs from '$lib/components/ViewTabs.svelte';
  import HintBar from '$lib/components/HintBar.svelte';
  import SearchPalette from '$lib/components/SearchPalette.svelte';

  let { children }: { children: import('svelte').Snippet } = $props();

  onMount(async () => {
    const res = await fetch('/api/words');
    const json = await res.json();
    initData(json.nodes, json.words);
  });

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
  {#if data.initialized}
    {@render children()}
  {:else}
    <div class="app-loading">
      <span class="app-loading-dot"></span>
    </div>
  {/if}
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

  .app-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .app-loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 1.2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.1); }
  }

  @media (max-width: 640px) {
    .main { width: 100vw; }
  }
</style>
