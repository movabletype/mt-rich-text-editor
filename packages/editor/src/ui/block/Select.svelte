<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-toolbar-item-block",
    extend: extendToolbarItem,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../item/registry/svelte";
  export interface Options {
    readonly blocks?: { value: string; label: string }[];
  }
</script>

<script lang="ts">
  import type { Level } from "@tiptap/extension-heading";
  import { ToolbarItemElement } from "../item/element";

  const element = $host<ToolbarItemElement<Options>>();
  const { options, tiptap } = element;
  let isOpen = $state(false);

  const blocks: Options["blocks"] = options.blocks ?? [
    { value: "paragraph", label: "本文" },
    { value: "h1", label: "見出し1" },
    { value: "h2", label: "見出し2" },
    { value: "h3", label: "見出し3" },
    { value: "h4", label: "見出し4" },
    { value: "h5", label: "見出し5" },
    { value: "h6", label: "見出し6" },
    { value: "pre", label: "コードブロック" },
  ];
  let selectedBlock = $state(blocks[0].value);

  element.onEditorUpdate = () => {
    if (!tiptap) {
      return;
    }

    const { $head: head } = tiptap.state.selection;
    const parent = head.parent;

    if (parent.type.name === "heading") {
      selectedBlock = `h${parent.attrs.level}`;
    } else {
      selectedBlock = parent.type.name;
      if (!blocks.some((b) => b.value === selectedBlock)) {
        selectedBlock = blocks[0].value;
      }
    }
  };

  function handleSelect(value: string) {
    if (value === "paragraph" || value === "pre") {
      tiptap?.chain().focus().setNode(value).run();
    } else if (value.match(/^h[1-6]$/)) {
      const level = parseInt(value.substring(1)) as Level;
      tiptap?.chain().focus().setHeading({ level }).run();
    }
    selectedBlock = value;
    isOpen = false;
  }

  function toggleDropdown(ev: MouseEvent) {
    if (!tiptap) {
      return;
    }
    ev.stopPropagation();
    isOpen = !isOpen;
  }

  function handleClickOutside() {
    isOpen = false;
  }

  let dropdownElement: HTMLElement;
  let isInitialized = $state(false);
  
  $effect(() => {
    if (isInitialized) return;
    isInitialized = true;
    
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<div class="dropdown" bind:this={dropdownElement}>
  <button class="selected" onclick={toggleDropdown}>
    {blocks.find((b) => b.value === selectedBlock)?.label}
    <span class="arrow"></span>
  </button>

  {#if isOpen}
    <div class="options">
      {#each blocks as block}
        <button
          class="option"
          class:active={selectedBlock === block.value}
          onclick={() => handleSelect(block.value)}
        >
          <div class={block.value}>
            {block.label}
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
    width: 150px;
  }

  .selected {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .arrow {
    width: 6px;
    height: 6px;
    border-right: 1px solid #666;
    border-bottom: 1px solid #666;
    transform: rotate(45deg);
    margin-left: 4px;
    position: relative;
    top: -2px;
  }

  .options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .option {
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    background: white;
    padding: 8px;
    cursor: pointer;
  }

  .option:hover {
    background-color: #f5f5f5;
  }

  .option.active {
    background-color: #e0e0e0;
  }

  /* 見出しスタイル */
  .h1 {
    font-size: 1.8em;
    font-weight: bold;
  }

  .h2 {
    font-size: 1.5em;
    font-weight: bold;
  }

  .h3 {
    font-size: 1.3em;
    font-weight: bold;
  }

  .h4 {
    font-size: 1.2em;
    font-weight: bold;
  }

  .h5 {
    font-size: 1.1em;
    font-weight: bold;
  }

  .h6 {
    font-size: 1em;
    font-weight: bold;
  }

  .paragraph {
    font-size: 1em;
  }

  .pre {
    font-family: monospace;
  }
</style>
