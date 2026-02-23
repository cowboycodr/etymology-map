<script lang="ts">
  import { data } from '$lib/stores/data.svelte.js';
  import { buildTree } from '$lib/treeBuilder.js';
  import TreeNode from '$lib/components/TreeNode.svelte';
  import LangTag from '$lib/components/LangTag.svelte';

  let {
    wordId,
    onClose,
    onWordClick
  }: {
    wordId: string;
    onClose: () => void;
    onWordClick: (wordId: string) => void;
  } = $props();

  const node = $derived(data.nodes[wordId]);
  const tree = $derived(
    wordId && data.initialized ? buildTree(wordId, data.nodes) : null
  );
</script>

<div class="absolute bottom-[14px] left-[14px] w-[min(380px,42vw)] max-h-[420px] bg-bg-surface border border-border rounded-lg overflow-hidden z-[6] flex flex-col shadow-panel max-md:left-[10px] max-md:right-[10px] max-md:w-auto max-md:max-h-[44dvh] max-md:bottom-[calc(10px+env(safe-area-inset-bottom,0px))]">
  <div class="flex items-center gap-1.75 px-2.5 py-2 border-b border-border flex-shrink-0">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <span class="font-semibold text-sm text-text-primary flex-1 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer transition-colors duration-100 hover:text-accent after:content-['→'] after:font-normal after:opacity-0 after:transition-opacity after:duration-150 after:text-accent hover:after:opacity-100" onclick={() => onWordClick(wordId)}>
      {node?.word}
    </span>
    <LangTag lang={node?.lang ?? ''} small />
    <button class="bg-none border-none text-text-muted cursor-pointer text-base p-0 px-0.5 line-height-1 flex-shrink-0 font-inherit transition-colors duration-100 hover:text-text-primary" onclick={onClose}>×</button>
  </div>
  <div class="flex-1 overflow-y-auto overflow-x-hidden py-1.5 px-2 pb-2.5 pl-1">
    {#if tree}
      <TreeNode
        node={tree}
        isLast={true}
        ancestorHasMore={[]}
        isRoot={true}
        compact={true}
        onNodeClick={(id) => onWordClick(id)}
      />
    {/if}
  </div>
</div>
