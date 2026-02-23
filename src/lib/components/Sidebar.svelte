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

<div class="w-[196px] bg-bg-surface border-r border-border flex flex-col flex-shrink-0 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:h-[72dvh] max-md:w-full max-md:z-50 max-md:translate-y-full max-md:transition-transform max-md:duration-[260ms] max-md:cubic-bezier-[0.32,0.72,0,1] max-md:border-r-none max-md:border-t border-border max-md:rounded-t-2xl max-md:pb-[env(safe-area-inset-bottom,0px)] max-md:before:content-[''] max-md:before:block max-md:before:w-9 max-md:before:h-1 max-md:before:bg-border max-md:before:rounded-sm max-md:before:mx-auto max-md:before:my-2.5" class:max-md:translate-y-0={open}>
  <div class="flex-1 overflow-y-auto py-1">
    {#each data.wordIds as wordId (wordId)}
      {@const entry = data.manifest[wordId]}
      {@const dotColor = langFillColor(entry?.originLang ?? '')}
      {@const isActive = $page.params.wordId === wordId}
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div
        class="flex items-center gap-1.75 px-[10px] py-1 mx-1 my-px rounded-sm cursor-pointer text-text-secondary transition-colors duration-80 select-none"
        class:bg-bg-hover={isActive}
        class:text-accent={isActive}
        class:hover:bg-bg-hover={!isActive}
        class:hover:text-text-primary={!isActive}
        onclick={() => handleWordClick(wordId)}
        role="button"
        tabindex="0"
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(wordId); }}
      >
        <span class="text-[9px]" style="color: {isActive ? 'var(--accent)' : dotColor}">◆</span>
        <span>{entry?.word ?? wordId}</span>
      </div>
    {/each}
  </div>
</div>
