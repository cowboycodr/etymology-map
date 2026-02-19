<script lang="ts">
  import { page } from '$app/stores';
  // Root/node detail page — shows node info + all containing word trees
  const nodeId = $derived($page.params.nodeId);
</script>

<p style="color:var(--text-muted);padding:2rem">root page for <code>{nodeId}</code> — coming soon</p>
