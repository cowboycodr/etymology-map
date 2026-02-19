<script lang="ts">
  import { page } from '$app/stores';
  // Local graph focused on params.wordId
  // Panel opened via ?panel=wordId query param
  const wordId = $derived($page.params.wordId);
</script>

<p style="color:var(--text-muted);padding:2rem">local graph for <code>{wordId}</code> — coming soon</p>
