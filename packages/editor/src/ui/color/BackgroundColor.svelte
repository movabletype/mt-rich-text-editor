<svelte:options customElement="mt-rich-text-editor-toolbar-item-backgroundcolor" />

<script module lang="ts">
  export interface Options {
    readonly presetColors?: string[];
  }
</script>

<script lang="ts">
  import { Editor } from "@tiptap/core";
  import type { EditorEvent } from "../item/registry";
  import { EditorEventType } from "../item/registry";
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

  function handleEditorInit({ tiptap }: EditorEvent) {
    editor = tiptap;
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

  function toggleColorPanel(ev: MouseEvent) {
    ev.stopPropagation();
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
    host.addEventListener(EditorEventType.Init, handleEditorInit);
    host.addEventListener(EditorEventType.Update, handleEditorUpdate);
    document.addEventListener("click", handleClickOutside);

    const options = JSON.parse(host.dataset.options ?? "{}") as Options;
    if (options.presetColors) {
      presetColors = options.presetColors;
    }

    return () => {
      host.removeEventListener(EditorEventType.Init, handleEditorInit);
      host.removeEventListener(EditorEventType.Update, handleEditorUpdate);
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<div bind:this={containerEl} onclick={toggleColorPanel} class="icon">
  {@html icon.replace(/fill="currentColor"/g, `fill="${selectedColor}"`)}
</div>

<div class="color-panel-container">
  {#if isOpen}
    <Panel {colors} onSelect={handleSelect} />
  {/if}
</div>

<style>
  .icon {
    width: 24px;
    height: 24px;
  }
  .color-panel-container {
    position: relative;
  }
</style>
