<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let { onToggleDrawer, onOpenSearch }: {
    onToggleDrawer: () => void;
    onOpenSearch: () => void;
  } = $props();

  let treeActive = $derived(($page.route.id ?? '').includes('/tree'));
  let graphActive = $derived(($page.route.id ?? '').includes('/graph'));

  function gotoTree() {
    const wid = $page.params.wordId;
    goto(wid ? `/tree/${wid}` : '/tree');
  }

  function gotoGraph() {
    const wid = $page.params.wordId;
    goto(wid ? `/graph/${wid}?panel=${wid}` : '/graph');
  }
</script>

<div class="view-tabs">
  <button class="menu-btn" onclick={onToggleDrawer} aria-label="words">☰</button>
  <button class="view-tab" class:active={treeActive} onclick={gotoTree}>tree</button>
  <button class="view-tab" class:active={graphActive} onclick={gotoGraph}>graph</button>
  <button class="menu-btn search-btn" onclick={onOpenSearch} aria-label="search">⌕</button>
</div>

<style>
  .view-tabs {
    display: flex;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .view-tab {
    font-family: inherit;
    font-size: 11px;
    padding: 6px 14px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    letter-spacing: 0.03em;
    transition: color 0.1s, border-color 0.1s;
    margin-bottom: -1px;
  }
  .view-tab:hover { color: var(--text-primary); }
  .view-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  .menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 17px;
    cursor: pointer;
    padding: 0 10px 0 4px;
    line-height: 1;
    flex-shrink: 0;
    transition: color 0.1s;
  }
  .menu-btn:hover { color: var(--text-primary); }

  .search-btn {
    margin-left: auto;
    padding: 0 4px 0 10px;
    font-size: 19px;
  }

  @media (max-width: 640px) {
    .menu-btn { display: flex; }
    .view-tab { padding: 9px 18px; }
  }
</style>
