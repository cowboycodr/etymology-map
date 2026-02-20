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
      class="node-row"
      class:root-hl={highlightId && node._id === highlightId}
      class:selected={selectedId === node._id}
      onclick={() => onRowClick?.(node._id)}
    >
      <div class="guides">
        {#each ancestorHasMore as hasMore}
          <span class="guide" class:pass={hasMore}></span>
        {/each}
        <span class="guide" class:elbow={isLast} class:tee={!isLast}></span>
      </div>
      <div class="node-label">
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <span
          class="node-word"
          data-nav-id={node._id}
          onclick={(e) => { e.stopPropagation(); onNodeClick?.(node._id); }}
        >{node.word}</span>
        {#if node.date}<span class="node-date">{node.date}</span>{/if}
        <LangTag lang={node.lang} small />
        {#if node.meaning && !compact}
          <span class="node-meaning">"{node.meaning}"</span>
        {/if}
      </div>
    </div>
  {/if}
  {#if node.roots && node.roots.length > 0}
    <div class="node-children">
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
  .node-row {
    display: flex;
    align-items: center;
    height: var(--row-h);
    border-radius: 3px;
    cursor: pointer;
    padding-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    transition: background 0.07s;
  }
  .node-row:hover { background: var(--bg-hover); }
  .node-row.selected {
    background: var(--bg-hover);
    box-shadow: inset 2px 0 0 var(--accent);
  }
  .node-row.root-hl { background: rgba(137, 180, 250, 0.07); }
  .node-row.root-hl :global(.node-word) { color: var(--accent); }

  .node-label {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 2px;
    overflow: hidden;
    min-width: 0;
  }

  .node-word {
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: color 0.1s;
    min-width: 0;
  }
  .node-word:hover {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .node-date { font-size: 11px; color: var(--text-muted); opacity: 0.7; }
  .node-meaning {
    font-size: 11.5px;
    color: var(--text-muted);
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  @media (max-width: 640px) {
    .node-meaning { display: none; }
    .node-word { overflow: hidden; text-overflow: ellipsis; }
  }
</style>
