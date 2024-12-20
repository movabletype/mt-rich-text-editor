<svelte:options customElement="mt-rich-text-editor-toolbar-item-backgroundcolor" />

<script module lang="ts">
  export interface Options {
    readonly presetColors?: string[];
  }
</script>

<script lang="ts">
  import { Editor } from "@tiptap/core";
  import { Event } from "../item/registry";
  import icon from "../icon/backgroundColor.svg?raw";
  import Panel from "./Panel.svelte";

  let editor: Editor | undefined = undefined;
  let isOpen = $state(false);

  let presetColors = $state<string[]>([]);
  const colors = [
    "#000000",
    "#595959",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#F06292",
    "#E57373",
    "#BA68C8",
    "#9575CD",
    "#7986CB",
    "#64B5F6",
    "#4FC3F7",
    "#4DD0E1",
    "#4DB6AC",
    "#81C784",
    "#AED581",
    "#FFF176",
    "#FFB74D",
    "#FF8A65",
    "#A1887F",
  ];

  let selectedColor = $state("#000000");

  function handleEditorInit(event: CustomEvent) {
    editor = event.detail.editor;
  }

  function handleEditorUpdate() {
    if (!editor) {
      return;
    }

    selectedColor = editor.getAttributes("textStyle").backgroundColor ?? "#000000";
  }

  function handleSelect(value: string) {
    if (!editor) {
      return;
    }

    editor.chain().focus().setBackgroundColor(value).run();
    isOpen = false;
  }

  function toggleColorPanel() {
    isOpen = !isOpen;
  }

  let rootNode: Node;
  let host: HTMLElement;
  function handleClickOutside(ev: MouseEvent) {
    if (ev.target !== host && (ev.target as Node).getRootNode() !== rootNode) {
      isOpen = false;
    }
  }

  let containerEl: HTMLElement;
  $effect(() => {
    rootNode = containerEl?.getRootNode();
    host = (rootNode as ShadowRoot).host as HTMLElement;
    host.addEventListener(Event.Init, handleEditorInit as EventListener);
    host.addEventListener(Event.Update, handleEditorUpdate as EventListener);
    document.addEventListener("click", handleClickOutside);

    const options = JSON.parse(host.dataset.options ?? "{}") as Options;
    if (options.presetColors) {
      presetColors = options.presetColors;
    }

    return () => {
      host.removeEventListener(Event.Init, handleEditorInit as EventListener);
      host.removeEventListener(Event.Update, handleEditorUpdate as EventListener);
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<div bind:this={containerEl} onclick={toggleColorPanel}>
  {@html icon.replace(/fill="currentColor"/g, `fill="${selectedColor}"`)}
</div>

<div class="color-panel-container">
  {#if isOpen}
    <Panel {colors} onSelect={handleSelect} />
  {/if}
</div>

<style>
  .color-panel-container {
    position: relative;
  }
</style>
