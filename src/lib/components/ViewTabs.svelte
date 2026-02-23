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

<div class="flex bg-bg-surface border-b border-border flex-shrink-0">
  <button class="hidden items-center justify-center bg-none border-none text-text-muted text-[17px] cursor-pointer p-0 pr-2.5 pl-1 line-height-1 flex-shrink-0 transition-colors duration-100 hover:text-text-primary max-md:flex" onclick={onToggleDrawer} aria-label="words">☰</button>
  <button class="font-inherit text-xs py-1.5 px-3.5 border-none border-b-2 border-transparent bg-transparent text-text-muted cursor-pointer tracking-[0.03em] transition-colors duration-100 -mb-px hover:text-text-primary" class:text-accent={treeActive} class:border-accent={treeActive} onclick={gotoTree}>tree</button>
  <button class="font-inherit text-xs py-1.5 px-3.5 border-none border-b-2 border-transparent bg-transparent text-text-muted cursor-pointer tracking-[0.03em] transition-colors duration-100 -mb-px hover:text-text-primary" class:text-accent={graphActive} class:border-accent={graphActive} onclick={gotoGraph}>graph</button>
  <button class="hidden items-center justify-center bg-none border-none text-text-muted cursor-pointer p-0 pl-2.5 pr-1 flex-shrink-0 transition-colors duration-100 hover:text-text-primary max-md:flex ml-auto text-[19px]" onclick={onOpenSearch} aria-label="search">⌕</button>
</div>
