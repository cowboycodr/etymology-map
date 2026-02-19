<div class="tree-area">
  <div class="empty-state">← select a word to trace its roots</div>
</div>

<style>
  .tree-area {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 12px 24px 24px 12px;
  }
  .empty-state {
    color: var(--text-muted);
    padding: 48px 24px;
    font-size: 12px;
  }
  @media (max-width: 640px) {
    .tree-area { overflow-x: hidden; }
  }
</style>
