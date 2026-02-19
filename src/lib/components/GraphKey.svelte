<div class="graph-key">
  <div class="graph-key-title">origin</div>
  <div class="graph-key-item"><span class="graph-key-dot" style="background:var(--c-pie)"></span>Proto-Indo-European</div>
  <div class="graph-key-item"><span class="graph-key-dot" style="background:var(--c-greek)"></span>Greek</div>
  <div class="graph-key-item"><span class="graph-key-dot" style="background:var(--c-latin)"></span>Latin / Romance</div>
  <div class="graph-key-item"><span class="graph-key-dot" style="background:var(--c-norse)"></span>Germanic</div>
  <div class="graph-key-item"><span class="graph-key-dot" style="background:var(--c-english)"></span>English</div>
  <div class="graph-key-item"><span class="graph-key-dot" style="background:var(--c-slavic)"></span>Slavic</div>
  <div class="graph-key-item"><span class="graph-key-dot" style="background:var(--c-iranian)"></span>Iranian / Semitic</div>
  <div class="graph-key-item"><span class="graph-key-dot" style="background:var(--c-other)"></span>Other</div>
</div>

<style>
  .graph-key {
    position: absolute;
    bottom: 14px;
    right: 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    z-index: 5;
    pointer-events: none;
  }

  .graph-key-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 7px;
  }

  .graph-key-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .graph-key-item:last-child { margin-bottom: 0; }

  .graph-key-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .graph-key { display: none; }
  }
</style>
