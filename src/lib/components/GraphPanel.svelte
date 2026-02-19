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

<div class="graph-panel">
  <div class="graph-panel-header">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <span class="graph-panel-word" onclick={() => onWordClick(wordId)}>
      {node?.word}
    </span>
    <LangTag lang={node?.lang ?? ''} small />
    <button class="graph-panel-close" onclick={onClose}>×</button>
  </div>
  <div class="graph-panel-tree">
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

<style>
  .graph-panel {
    position: absolute;
    bottom: 14px;
    left: 14px;
    width: min(380px, 42vw);
    max-height: 420px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    z-index: 6;
    display: flex;
    flex-direction: column;
    box-shadow: var(--panel-shadow);
  }

  .graph-panel-header {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .graph-panel-word {
    font-weight: 600;
    font-size: 13px;
    color: var(--text-primary);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: color 0.1s;
  }

  .graph-panel-word::after {
    content: ' →';
    font-weight: 400;
    opacity: 0;
    transition: opacity 0.15s;
    color: var(--accent);
  }

  .graph-panel-word:hover { color: var(--accent); }
  .graph-panel-word:hover::after { opacity: 1; }

  .graph-panel-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 16px;
    padding: 0 2px;
    line-height: 1;
    flex-shrink: 0;
    font-family: inherit;
    transition: color 0.1s;
  }

  .graph-panel-close:hover { color: var(--text-primary); }

  .graph-panel-tree {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 6px 8px 10px 4px;
  }

  /* panel tree is compact — hide meanings, clip labels to prevent overflow */
  .graph-panel-tree :global(.node-meaning) { display: none; }
  .graph-panel-tree :global(.node-label) { overflow: hidden; }
  .graph-panel-tree :global(.node-word) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 640px) {
    .graph-panel {
      left: 10px;
      right: 10px;
      width: auto;
      max-height: 44dvh;
      bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    }
  }
</style>
