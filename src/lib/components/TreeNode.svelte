<script lang="ts">
  import TreeNode from './TreeNode.svelte'; // explicit self-import required for recursion in Svelte 5
  import LangTag from './LangTag.svelte';

  let {
    node,
    isLast,
    ancestorHasMore,
    isRoot = false,
    highlightId = null,
    compact = false,
    selectedId = null,
    onNodeClick,
    onRowClick
  }: {
    node: import('$lib/types.js').TreeNode;
    isLast: boolean;
    ancestorHasMore: boolean[];
    isRoot?: boolean;
    highlightId?: string | null;
    compact?: boolean;
    selectedId?: string | null;
    onNodeClick?: (nodeId: string) => void;
    onRowClick?: (nodeId: string) => void;
  } = $props();
</script>

<div class="tree-node">
  {#if !isRoot}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      class="flex items-start min-h-[26px] rounded-sm cursor-pointer pr-2.5 overflow-hidden transition-colors duration-70"
      class:bg-bg-hover={selectedId === node._id}
      class:shadow-[inset_2px_0_0_var(--accent)]={selectedId === node._id}
      class:hover:bg-bg-hover={selectedId !== node._id}
      class:bg-[rgba(137,180,250,0.07)]={highlightId && node._id === highlightId && selectedId !== node._id}
      onclick={() => onRowClick?.(node._id)}
    >
      <div class="flex items-stretch h-[26px] flex-shrink-0">
        {#each ancestorHasMore as hasMore}
          <span class="guide" class:pass={hasMore}></span>
        {/each}
        <span class="guide" class:elbow={isLast} class:tee={!isLast}></span>
      </div>
      <div class="flex flex-col flex-1 min-w-0 pl-0.5">
        <div class="flex items-center gap-1.75 h-[26px] whitespace-nowrap overflow-hidden min-w-0">
          <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
          <span
            class="font-medium text-text-primary cursor-pointer transition-colors duration-100 flex-shrink-0 hover:text-accent hover:underline hover:underline-offset-2"
            class:text-accent={highlightId && node._id === highlightId}
            data-nav-id={node._id}
            onclick={(e) => { e.stopPropagation(); onNodeClick?.(node._id); }}
          >{node.word}</span>
          {#if node.date}<span class="text-xs text-text-muted opacity-70 flex-shrink-0">{node.date}</span>{/if}
          <LangTag lang={node.lang} small />
        </div>
        {#if node.meaning && !compact}
          <div class="text-xs text-text-muted italic leading-6 pb-1.25 whitespace-normal">"{node.meaning}"</div>
        {/if}
      </div>
    </div>
  {/if}
  {#if node.roots && node.roots.length > 0}
    <div>
      {#each node.roots as child, i}
        <TreeNode
          node={child}
          isLast={i === node.roots.length - 1}
          ancestorHasMore={isRoot ? [] : [...ancestorHasMore, !isLast]}
          {highlightId}
          {compact}
          {selectedId}
          {onNodeClick}
          {onRowClick}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .guide {
    width: var(--guide-w);
    height: var(--row-h);
    position: relative;
    flex-shrink: 0;
  }
  .guide.pass::before {
    content: '';
    position: absolute;
    left: 9px; top: 0; bottom: 0;
    width: 1px;
    background: var(--tree-line);
  }
  .guide.tee::before {
    content: '';
    position: absolute;
    left: 9px; top: 0; bottom: 0;
    width: 1px;
    background: var(--tree-line);
  }
  .guide.tee::after {
    content: '';
    position: absolute;
    left: 9px;
    top: calc(var(--row-h) / 2);
    right: 0;
    height: 1px;
    background: var(--tree-line);
  }
  .guide.elbow::before {
    content: '';
    position: absolute;
    left: 9px; top: 0;
    height: calc(var(--row-h) / 2);
    width: 1px;
    background: var(--tree-line);
  }
  .guide.elbow::after {
    content: '';
    position: absolute;
    left: 9px;
    top: calc(var(--row-h) / 2);
    right: 0;
    height: 1px;
    background: var(--tree-line);
  }
</style>
