<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { initManifest, initFromWordsJson, data } from '$lib/stores/data.svelte.js';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ViewTabs from '$lib/components/ViewTabs.svelte';
  import HintBar from '$lib/components/HintBar.svelte';
  import SearchPalette from '$lib/components/SearchPalette.svelte';

  let { children }: { children: import('svelte').Snippet } = $props();

  onMount(async () => {
    try {
      const res = await fetch('/api/words');
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      if (!json.manifest) throw new Error('no manifest');
      initManifest(json.wordIds, json.manifest);
    } catch {
      // API not available (e.g. vite preview without wrangler) — fall back to full words.json
      const res = await fetch('/words.json');
      const json = await res.json();
      initFromWordsJson(json.nodes, json.words);
    }
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
<div class="fixed inset-0 bg-black/52 z-40 backdrop-blur-[2px] cursor-pointer" class:hidden={!drawerOpen} onclick={() => drawerOpen = false}></div>
<Sidebar bind:open={drawerOpen} />
<div class="flex-1 flex flex-col overflow-hidden min-w-0 max-sm:w-screen">
  <ViewTabs onToggleDrawer={() => drawerOpen = !drawerOpen} onOpenSearch={() => paletteOpen = true} />
  {#if data.manifestReady}
    {@render children()}
  {:else}
    <div class="flex-1 flex items-center justify-center">
      <span class="w-2 h-2 rounded-full bg-accent animate-pulse-slow"></span>
    </div>
  {/if}
  <HintBar />
</div>
