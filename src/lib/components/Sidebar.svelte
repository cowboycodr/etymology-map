<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { data } from '$lib/stores/data.svelte.js';
  import { langFillColor } from '$lib/langUtils.js';

  let { open = $bindable(false) }: { open: boolean } = $props();

  function handleWordClick(wordId: string) {
    open = false;
    const routeId = $page.route.id ?? '';
    if (routeId.startsWith('/graph')) {
      goto(`/graph/${wordId}?panel=${wordId}`);
    } else {
      goto(`/tree/${wordId}`);
    }
  }
</script>

<div class="sidebar" class:open>
  <div class="word-list">
    {#each data.wordIds as wordId (wordId)}
      {@const node = data.nodes[wordId]}
      {@const parentId = (node?.roots ?? [])[0]}
      {@const originLang = (parentId && data.nodes[parentId]?.lang) ? data.nodes[parentId].lang : (node?.lang ?? '')}
      {@const dotColor = langFillColor(originLang)}
      {@const isActive = $page.params.wordId === wordId}
      <div
        class="word-item"
        class:active={isActive}
        onclick={() => handleWordClick(wordId)}
        role="button"
        tabindex="0"
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(wordId); }}
      >
        <span class="dot" style="--dot-color: {dotColor}">◆</span>
        <span>{node?.word ?? wordId}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .sidebar {
    width: 196px;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .word-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .word-item {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 4px 10px;
    margin: 1px 4px;
    border-radius: 3px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: background 0.08s, color 0.08s;
    user-select: none;
  }
  .word-item:hover { background: var(--bg-hover); color: var(--text-primary); }
  .word-item.active { background: var(--accent-bg); color: var(--accent); }

  .dot {
    font-size: 9px;
    color: var(--dot-color, var(--text-muted));
    flex-shrink: 0;
  }
  .word-item.active .dot { color: var(--accent); }

  @media (max-width: 640px) {
    .sidebar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 72dvh;
      width: 100%;
      z-index: 50;
      transform: translateY(100%);
      transition: transform 0.26s cubic-bezier(0.32, 0.72, 0, 1);
      border-right: none;
      border-top: 1px solid var(--border);
      border-radius: 16px 16px 0 0;
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
    .sidebar.open { transform: translateY(0); }

    .sidebar::before {
      content: '';
      display: block;
      width: 36px;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      margin: 10px auto 6px;
    }

    .word-item { padding: 8px 14px; }
  }
</style>
