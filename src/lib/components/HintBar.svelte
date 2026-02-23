<script lang="ts">
  import { page } from '$app/stores';

  let isGraphRoute = $derived(($page.route.id ?? '').includes('/graph'));
</script>

<div class="flex-shrink-0 px-[22px] py-1.25 border-t border-border bg-bg-surface gap-4 flex items-center max-md:hidden">
  {#if isGraphRoute}
    <span class="text-[10px] text-text-muted">drag to pan · scroll to zoom</span>
    <span class="text-[10px] text-text-muted">click word to inspect</span>
    <span class="text-[10px] text-text-muted"><kbd class="hk">esc</kbd> close panel</span>
  {:else}
    <span class="text-[10px] text-text-muted"><kbd class="hk">⌘K</kbd> search roots</span>
    <span class="text-[10px] text-text-muted"><kbd class="hk">j</kbd><kbd class="hk">k</kbd> navigate</span>
    <span class="text-[10px] text-text-muted"><kbd class="hk">h</kbd><kbd class="hk">l</kbd> parent / child</span>
    <span class="text-[10px] text-text-muted"><kbd class="hk">gg</kbd> top · <kbd class="hk">G</kbd> bottom</span>
    <span class="text-[10px] text-text-muted"><kbd class="hk">enter</kbd> open</span>
  {/if}
</div>
