<script lang="ts">
  import '../app.css';
  import { initData } from '$lib/stores/data.svelte.js';
  import type { LayoutData } from './$types.js';

  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

  // Initialize the global data store once on mount
  $effect(() => {
    initData(data.nodes, data.wordIds);
  });
</script>

<div style="display:contents">
  {@render children()}
</div>
