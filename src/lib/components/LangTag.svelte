<script lang="ts">
  import { langClass, langDescription } from '$lib/langUtils.js';

  let { lang, small = false }: { lang: string; small?: boolean } = $props();

  const tooltip = $derived(langDescription(lang));

  let visible = $state(false);
  let x = $state(0);
  let y = $state(0);
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  function show(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top - 6;
    visible = true;
    if (dismissTimer) clearTimeout(dismissTimer);
  }

  function hide() {
    visible = false;
    if (dismissTimer) clearTimeout(dismissTimer);
  }

  function handleClick(e: MouseEvent) {
    if (!tooltip) return;
    e.stopPropagation();
    if (visible) {
      hide();
    } else {
      show(e.currentTarget as HTMLElement);
      // auto-dismiss on mobile after 4s
      dismissTimer = setTimeout(hide, 4000);
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<span
  class="lang-tag {langClass(lang)}"
  class:small
  class:has-tip={!!tooltip}
  onmouseenter={(e) => tooltip && show(e.currentTarget as HTMLElement)}
  onmouseleave={() => tooltip && hide()}
  onclick={handleClick}
>{lang}</span>

{#if visible && tooltip}
  <div class="lang-tooltip" style="left:{x}px;top:{y}px">
    <strong>{lang}</strong>
    {tooltip}
  </div>
{/if}

<style>
  .lang-tag.has-tip { cursor: help; }

  /* small variant */
  .lang-tag.small {
    font-size: 10px;
    padding: 1px 5px;
  }

  .lang-tooltip {
    position: fixed;
    transform: translate(-50%, -100%);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--text-muted);
    pointer-events: none;
    z-index: 9999;
    max-width: 260px;
    white-space: normal;
    text-align: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  .lang-tooltip strong {
    display: block;
    color: var(--text-primary);
    margin-bottom: 2px;
    font-size: 12px;
  }
</style>
