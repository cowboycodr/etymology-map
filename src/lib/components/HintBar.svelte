<script lang="ts">
  import { page } from '$app/stores';

  let isGraphRoute = $derived(($page.route.id ?? '').includes('/graph'));
</script>

<div class="hint-bar">
  {#if isGraphRoute}
    <span>drag to pan · scroll to zoom</span>
    <span>click word to inspect</span>
    <span><kbd class="hk">esc</kbd> close panel</span>
  {:else}
    <span><kbd class="hk">⌘K</kbd> search roots</span>
    <span><kbd class="hk">j</kbd><kbd class="hk">k</kbd> navigate</span>
    <span><kbd class="hk">h</kbd><kbd class="hk">l</kbd> parent / child</span>
    <span><kbd class="hk">gg</kbd> top · <kbd class="hk">G</kbd> bottom</span>
    <span><kbd class="hk">enter</kbd> open</span>
  {/if}
</div>

<style>
  .hint-bar {
    flex-shrink: 0;
    padding: 5px 22px;
    border-top: 1px solid var(--border);
    background: var(--bg-surface);
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .hint-bar :global(span) {
    font-size: 10px;
    color: var(--text-muted);
  }

  @media (max-width: 640px) {
    .hint-bar { display: none; }
  }
</style>
