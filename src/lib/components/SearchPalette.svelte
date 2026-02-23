<script lang="ts">
  import { goto } from '$app/navigation';
  import { data, initAllData } from '$lib/stores/data.svelte.js';
  import { searchAllNodes, hlMatch } from '$lib/searchEngine.js';
  import { langClass } from '$lib/langUtils.js';
  import type { SearchResult } from '$lib/types.js';

  let { open = $bindable(false) }: { open: boolean } = $props();

  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let focusedIndex = $state(-1);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Lazy-load full data the first time the palette opens
  $effect(() => {
    if (!open) return;
    if (data.allLoaded) return;
    fetch('/api/all')
      .then(r => r.json())
      .then(json => initAllData(json.wordIds, json.nodes, json.containedIn));
  });

  $effect(() => {
    if (open && inputEl) {
      query = '';
      results = [];
      focusedIndex = -1;
      setTimeout(() => inputEl?.focus(), 0);
    }
  });

  function handleInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!data.searchReady) return; // full index not yet built
      results = searchAllNodes(query, data.nodes, data.containedIn, data.searchIndex);
      focusedIndex = -1;
    }, 80);
  }

  function moveFocus(dir: 1 | -1) {
    if (!results.length) return;
    focusedIndex = Math.max(0, Math.min(focusedIndex + dir, results.length - 1));
  }

  function pick(i: number) {
    const r = results[i];
    if (!r) return;
    open = false;
    if (data.wordIds.includes(r.nodeId)) {
      goto(`/tree/${r.nodeId}`);
    } else {
      goto(`/root/${r.nodeId}`);
    }
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      open = false;
    } else if (e.key === 'ArrowDown' || (e.key === 'j' && !(e.target instanceof HTMLInputElement))) {
      e.preventDefault();
      moveFocus(1);
    } else if (e.key === 'ArrowUp' || (e.key === 'k' && !(e.target instanceof HTMLInputElement))) {
      e.preventDefault();
      moveFocus(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0) {
        pick(focusedIndex);
      } else if (results.length > 0) {
        moveFocus(1);
        inputEl?.blur();
      }
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

{#if open}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed inset-0 bg-black/55 backdrop-blur-md z-[999] flex items-start justify-center pt-[14vh] max-md:items-end max-md:pt-0" onmousedown={(e) => { if (e.target === e.currentTarget) open = false; }}>
  <div class="w-[580px] max-w-[calc(100vw-40px)] bg-bg-surface border border-[#45475a] rounded-[10px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)] max-md:w-full max-md:max-w-full max-md:rounded-b-none max-md:max-h-[92dvh]">
    <div class="flex items-center gap-2.5 px-4 py-3.25 border-b border-border">
      <span class="text-text-muted text-[15px] flex-shrink-0">⌕</span>
      <input
        bind:this={inputEl}
        bind:value={query}
        oninput={handleInput}
        class="flex-1 bg-transparent border-none outline-none text-text-primary font-inherit text-sm max-md:text-base"
        placeholder="Search roots, languages, meanings…"
        autocomplete="off"
        spellcheck={false}
        autocapitalize="none"
        autocorrect="off"
      />
      <kbd class="hk">esc</kbd>
    </div>
    <div class="max-h-[380px] overflow-y-auto py-1.5 pb-2 max-md:max-h-[48dvh] max-md:pb-2 max-md:pb-[calc(8px+env(safe-area-inset-bottom,0px))]">
      {#if !data.searchReady}
        <div class="py-5 px-[18px] text-xs text-text-muted text-center">loading search index…</div>
      {:else if !query.trim()}
        <div class="py-5 px-[18px] text-xs text-text-muted text-center">search across all etymology trees</div>
      {:else if results.length === 0}
        <div class="py-5 px-[18px] text-xs text-text-muted text-center">no results</div>
      {:else}
        {#each results as result, i}
          {@const isTopLevel = data.wordIds.includes(result.nodeId)}
          {@const inLabels = result.inWords.slice(0, 3).map(wid => data.nodes[wid]?.word ?? wid).join(', ') + (result.inWords.length > 3 ? ` +${result.inWords.length - 3}` : '')}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="flex flex-col gap-0.75 px-3.5 py-2 mx-1.5 rounded-sm cursor-pointer transition-colors duration-70"
            class:bg-bg-hover={i === focusedIndex}
            class:hover:bg-bg-hover={i !== focusedIndex}
            onmousedown={() => pick(i)}
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-semibold text-text-primary">{@html hlMatch(result.node.word, query)}</span>
              <span class="lang-tag {langClass(result.node.lang)} text-[10px] px-[5px]">{result.node.lang}</span>
              {#if !isTopLevel && result.inWords.length > 0}
                <span class="text-xs bg-accent-bg text-accent px-1.5 rounded-sm ml-auto">in {inLabels}</span>
              {/if}
            </div>
            {#if result.node.meaning}
              <div class="text-xs text-text-muted italic whitespace-nowrap overflow-hidden text-ellipsis">{result.node.meaning}</div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
{/if}

<style>
  :global(mark) {
    background: rgba(137, 180, 250, 0.2);
    color: var(--accent);
    border-radius: 2px;
    font-weight: inherit;
  }
</style>
