<script lang="ts">
  const { title }: { title: string } = $props();
</script>

<div id="mt-rich-text-editor-tooltip" class="mt-rich-text-editor-tooltip">
  {title}
</div>

<style>
  div {
    position: absolute;
    top: 110%;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    background: black;
    padding: 4px;
    border-radius: 5px;
    width: max-content;
    max-width: 200px;
    white-space: nowrap;
    font-size: 90%;
    z-index: 2000;
  }
</style>
