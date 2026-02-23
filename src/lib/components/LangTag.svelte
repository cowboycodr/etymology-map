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
  class="lang-tag {langClass(lang)} text-[10px] px-[5px] rounded-sm font-medium tracking-[0.02em] flex-shrink-0"
  class:text-[10px]={small}
  class:px-[5px]={small}
  class:cursor-help={!!tooltip}
  onmouseenter={(e) => tooltip && show(e.currentTarget as HTMLElement)}
  onmouseleave={() => tooltip && hide()}
  onclick={handleClick}
>{lang}</span>

{#if visible && tooltip}
  <div class="fixed z-[9999] transform -translate-x-1/2 -translate-y-full bg-bg-surface border border-border rounded-md py-1.5 px-2.5 text-xs leading-[1.5] text-text-muted pointer-events-none max-w-[260px] whitespace-normal text-center shadow-[0_4px_16px_rgba(0,0,0,0.25)]" style="left:{x}px;top:{y}px">
    <strong class="block text-text-primary mb-0.5 text-xs">{lang}</strong>
    {tooltip}
  </div>
{/if}
