<script lang="ts">
  import { page } from '$app/stores';
  // Word tree view for params.wordId
  const wordId = $derived($page.params.wordId);
</script>

<p style="color:var(--text-muted);padding:2rem">tree for <code>{wordId}</code> — coming soon</p>
