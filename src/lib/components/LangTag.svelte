<script lang="ts">
  import { langClass } from '$lib/langUtils.js';

  let { lang, small = false }: { lang: string; small?: boolean } = $props();
</script>

<span class="lang-tag {langClass(lang)}" class:small>{lang}</span>

<style>
  /* lang-tag base styles are global in app.css */
  /* small variant */
  .lang-tag.small {
    font-size: 10px;
    padding: 1px 5px;
  }
</style>
