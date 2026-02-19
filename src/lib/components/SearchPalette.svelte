<script lang="ts">
  import { goto } from '$app/navigation';
  import { data } from '$lib/stores/data.svelte.js';
  import { searchAllNodes, hlMatch } from '$lib/searchEngine.js';
  import { langClass } from '$lib/langUtils.js';
  import type { SearchResult } from '$lib/types.js';

  let { open = $bindable(false) }: { open: boolean } = $props();

  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let focusedIndex = $state(-1);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
<div class="cmd-overlay" onmousedown={(e) => { if (e.target === e.currentTarget) open = false; }}>
  <div class="cmd-modal">
    <div class="cmd-search-row">
      <span class="cmd-search-icon">⌕</span>
      <input
        bind:this={inputEl}
        bind:value={query}
        oninput={handleInput}
        class="cmd-input"
        placeholder="Search roots, languages, meanings…"
        autocomplete="off"
        spellcheck={false}
        autocapitalize="none"
        autocorrect="off"
      />
      <kbd class="cmd-esc-key">esc</kbd>
    </div>
    <div class="cmd-results">
      {#if !query.trim()}
        <div class="cmd-hint">search across all etymology trees</div>
      {:else if results.length === 0}
        <div class="cmd-hint">no results</div>
      {:else}
        {#each results as result, i}
          {@const isTopLevel = data.wordIds.includes(result.nodeId)}
          {@const inLabels = result.inWords.slice(0, 3).map(wid => data.nodes[wid]?.word ?? wid).join(', ') + (result.inWords.length > 3 ? ` +${result.inWords.length - 3}` : '')}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="cmd-result"
            class:focused={i === focusedIndex}
            onmousedown={() => pick(i)}
          >
            <div class="cmd-result-top">
              <span class="cmd-match-word">{@html hlMatch(result.node.word, query)}</span>
              <span class="lang-tag {langClass(result.node.lang)}" style="font-size:10px;padding:1px 5px">{result.node.lang}</span>
              {#if !isTopLevel && result.inWords.length > 0}
                <span class="cmd-in-tag">in {inLabels}</span>
              {/if}
            </div>
            {#if result.node.meaning}
              <div class="cmd-meaning">{result.node.meaning}</div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
{/if}

<style>
  .cmd-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 999;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 14vh;
  }

  .cmd-modal {
    width: 580px;
    max-width: calc(100vw - 40px);
    background: var(--bg-surface);
    border: 1px solid #45475a;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.7);
  }

  .cmd-search-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 16px;
    border-bottom: 1px solid var(--border);
  }

  .cmd-search-icon {
    color: var(--text-muted);
    font-size: 15px;
    flex-shrink: 0;
  }

  .cmd-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 14px;
  }

  .cmd-input::placeholder {
    color: var(--text-muted);
  }

  .cmd-esc-key {
    font-family: inherit;
    font-size: 10px;
    color: var(--text-muted);
    background: var(--bg-hover);
    border: 1px solid #45475a;
    border-radius: 3px;
    padding: 2px 6px;
    flex-shrink: 0;
  }

  .cmd-results {
    max-height: 380px;
    overflow-y: auto;
    padding: 6px 0 8px;
  }

  .cmd-hint {
    padding: 20px 18px;
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
  }

  .cmd-result {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 8px 14px;
    margin: 2px 6px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.07s;
  }

  .cmd-result:hover,
  .cmd-result.focused {
    background: var(--bg-hover);
  }

  .cmd-result-top {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .cmd-match-word {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .cmd-match-word :global(mark) {
    background: rgba(137, 180, 250, 0.2);
    color: var(--accent);
    border-radius: 2px;
    font-weight: inherit;
  }

  .cmd-in-tag {
    font-size: 10px;
    background: var(--accent-bg);
    color: var(--accent);
    padding: 1px 6px;
    border-radius: 3px;
    margin-left: auto;
  }

  .cmd-path {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cmd-meaning {
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cmd-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 8px 20px 4px;
  }

  @media (max-width: 640px) {
    .cmd-overlay {
      align-items: flex-end;
      padding-top: 0;
    }

    .cmd-modal {
      width: 100%;
      max-width: 100%;
      border-radius: 14px 14px 0 0;
      border-bottom: none;
      max-height: 92dvh;
    }

    .cmd-results {
      max-height: 48dvh;
      padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    }

    .cmd-esc-key {
      display: none;
    }

    .cmd-input {
      font-size: 16px;
    }
  }
</style>
