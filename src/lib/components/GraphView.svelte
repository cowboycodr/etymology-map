<script lang="ts">
  import * as d3 from 'd3';
  import { langFillColor, cssVar } from '$lib/langUtils.js';
  import type { GraphNode, GraphEdge, GraphData } from '$lib/graphData.js';

  let {
    mode,
    data: graphData,
    panelWordId = null,
    onNodeClick
  }: {
    mode: 'global' | 'local';
    data: GraphData;
    panelWordId?: string | null;
    onNodeClick: (nodeId: string, isWord: boolean, isFocused: boolean) => void;
  } = $props();

  let containerEl: HTMLDivElement;
  let svgEl: SVGSVGElement;
  let tooltipEl: HTMLDivElement;
  let simulation: d3.Simulation<GraphNode, GraphEdge> | null = null;

  $effect(() => {
    // Track reactive dependencies
    const _mode = mode;
    const _data = graphData;
    const _panelWordId = panelWordId;

    // Wait for DOM
    if (!containerEl || !svgEl) return;

    // Destroy previous simulation
    simulation?.stop();
    simulation = null;

    const W = containerEl.clientWidth;
    const H = containerEl.clientHeight;

    // Clear previous SVG content
    const svg = d3.select(svgEl)
      .attr('width', W)
      .attr('height', H)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0');
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.12, 10])
      .on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoomBehavior);
    svg.on('dblclick.zoom', null);
    svg.on('dblclick', () =>
      svg.transition().duration(500).call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(W / 2, H / 2).scale(1)
      )
    );

    // Deep copy nodes so D3 can mutate x/y
    const nodes: GraphNode[] = _data.nodes.map(n => ({
      ...n,
      x: W / 2 + (Math.random() - 0.5) * 500,
      y: H / 2 + (Math.random() - 0.5) * 400
    }));
    const edges = _data.edges.map(e => ({ ...e }));

    // Links
    const link = g.append('g').selectAll('line').data(edges).join('line')
      .attr('stroke', (e: any) => e.isTreeEdge === false ? cssVar('--graph-link-dim') : cssVar('--graph-link'))
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', (e: any) => e.count ? Math.min(1 + e.count * 0.35, 3.5) : 1.2)
      .attr('stroke-dasharray', (e: any) => e.isTreeEdge === false ? '4,3' : null);

    // Node groups
    const nodeG = g.append('g').selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (e, d) => { if (!e.active) simulation?.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on('end', (e, d) => { if (!e.active) simulation?.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Circles
    nodeG.append('circle')
      .attr('r', (d: GraphNode) => {
        if (d.isFocused) return 9;
        if (_mode === 'global') return Math.max(4, Math.min(4 + (d.degree || 0) * 1.2, 11));
        return d.isWord ? 7 : 4;
      })
      .attr('fill', (d: GraphNode) => langFillColor(d.originLang || d.lang))
      .attr('fill-opacity', (d: GraphNode) => d.isNeighbor ? 0.6 : 1)
      .attr('stroke', (d: GraphNode) => (d.isFocused || d.id === _panelWordId) ? cssVar('--accent') : 'none')
      .attr('stroke-width', (d: GraphNode) => d.id === _panelWordId ? 3 : (d.isFocused ? 2 : 0))
      .style('filter', (d: GraphNode) => {
        if (d.id === _panelWordId) return `drop-shadow(0 0 8px ${cssVar('--accent')}bf)`;
        if (d.isFocused) return `drop-shadow(0 0 6px ${cssVar('--accent')}99)`;
        return null;
      });

    // Labels
    nodeG.append('text')
      .text((d: GraphNode) => d.word)
      .attr('class', (d: GraphNode) => `glt-${d.isFocused ? 'focused' : d.isWord ? 'word' : 'muted'}`)
      .attr('font-family', "'SF Mono','Cascadia Code',Menlo,Consolas,monospace")
      .attr('font-size', (d: GraphNode) => d.isFocused ? 13 : d.isWord ? 11 : 9)
      .attr('font-weight', (d: GraphNode) => (d.isFocused || d.isWord) ? 500 : 400)
      .attr('fill-opacity', (d: GraphNode) => (!d.isWord && _mode === 'global') ? 0 : 1)
      .attr('dx', (d: GraphNode) => d.isFocused ? 11 : d.isWord ? 9 : 6)
      .attr('dy', '0.35em')
      .attr('user-select', 'none');

    // Tooltip
    nodeG
      .on('mouseenter', (_e, d: GraphNode) => {
        tooltipEl.innerHTML = `<div class="tip-word">${d.word}</div><div class="tip-lang">${d.lang}</div>${d.meaning ? `<div class="tip-meaning">"${d.meaning}"</div>` : ''}`;
        tooltipEl.classList.add('visible');
      })
      .on('mousemove', (e: MouseEvent) => {
        const rect = containerEl.getBoundingClientRect();
        tooltipEl.style.left = `${Math.min(e.clientX - rect.left + 14, W - 236)}px`;
        tooltipEl.style.top = `${Math.max(e.clientY - rect.top - 40, 4)}px`;
      })
      .on('mouseleave', () => tooltipEl.classList.remove('visible'));

    // Clicks
    nodeG.on('click', (e: MouseEvent, d: GraphNode) => {
      e.stopPropagation();
      tooltipEl.classList.remove('visible');
      onNodeClick(d.id, d.isWord ?? false, d.isFocused ?? false);
    });

    // Force simulation
    simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edges).id(d => d.id).distance(_mode === 'global' ? 130 : 100))
      .force('charge', d3.forceManyBody().strength(_mode === 'global' ? -220 : -280))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide<GraphNode>(d => d.isFocused ? 20 : d.isWord ? 16 : 9));

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      nodeG.attr('transform', (d: GraphNode) => `translate(${(d.x ?? 0) | 0},${(d.y ?? 0) | 0})`);
    });

    return () => {
      simulation?.stop();
      simulation = null;
    };
  });

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(() => {
      if (svgEl && containerEl) {
        d3.select(svgEl)
          .attr('width', containerEl.clientWidth)
          .attr('height', containerEl.clientHeight);
      }
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  });
</script>

<div class="graph-area" bind:this={containerEl}>
  <svg bind:this={svgEl}></svg>
  <div class="graph-tooltip" bind:this={tooltipEl}></div>
</div>

<style>
  .graph-area {
    flex: 1;
    overflow: hidden;
    position: relative;
    background: var(--bg-base);
    min-height: 0;
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
  }

  .graph-tooltip {
    position: absolute;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 7px 11px;
    font-size: 11px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.12s;
    max-width: 220px;
    z-index: 10;
    line-height: 1.6;
  }

  :global(.graph-tooltip.visible) { opacity: 1; }

  :global(.tip-word) { font-weight: 600; font-size: 12px; color: var(--text-primary); }
  :global(.tip-lang) { color: var(--text-muted); font-size: 10px; }
  :global(.tip-meaning) { color: var(--text-muted); font-style: italic; }
</style>
