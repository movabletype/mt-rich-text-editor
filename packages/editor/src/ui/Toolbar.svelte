<script lang="ts">
  import type { Editor } from "@tiptap/core";
  import {
    prefix,
    getDefinedButton,
    EditorButtonInitEvent,
    EditorButtonClickEvent,
    EditorButtonUpdateEvent,
  } from "./button/registry";

  const {
    editor,
    toolbar,
    options,
  }: {
    editor: Editor;
    toolbar: string[][][];
    options: Record<string, any>;
  } = $props();

  const prefixLength = prefix.length;
  const buttonRefs: Record<string, HTMLElement> = {};
  const buttons = toolbar.map((row) =>
    row.map((group) =>
      group.map((name) => ({
        elementName: getDefinedButton(name),
        options: options[name] ?? {},
      }))
    )
  );
  const isActiveMap: Record<string, boolean> = $state({});
  const isDisabledMap: Record<string, boolean> = $state({});
  function update() {
    for (const key in buttonRefs) {
      buttonRefs[key].dispatchEvent(new EditorButtonUpdateEvent(editor));
      isActiveMap[key] = buttonRefs[key].classList.contains("is-active");
      isDisabledMap[key] = buttonRefs[key].classList.contains("is-disabled");
    }
  }
  editor.on("selectionUpdate", update);
  $effect(() => {
    update();
  });

  function bindRef(node: HTMLElement, key: string) {
    buttonRefs[key] = node;
    setTimeout(() => {
      node.dispatchEvent(new EditorButtonInitEvent(editor));
    });
    return {
      destroy() {
        delete buttonRefs[key];
      },
    };
  }
</script>

<div class="mt-rich-text-editor-toolbar">
  {#each buttons as row}
    <div class="mt-rich-text-editor-toolbar-row">
      {#each row as group}
        <div
          class={`mt-rich-text-editor-toolbar-group ${group.length === 1 ? `mt-rich-text-editor-toolbar-group--${group[0].elementName.substring(prefixLength)}` : ""}`}
        >
          {#each group as button}
            <svelte:element
              this={button.elementName}
              use:bindRef={button.elementName}
              data-options={JSON.stringify(button.options)}
              class="button"
              class:is-active={isActiveMap[button.elementName]}
              class:is-disabled={isDisabledMap[button.elementName]}
              onclick={(ev) => {
                ev.currentTarget.dispatchEvent(new EditorButtonClickEvent(editor));
                update();
              }}
            />
          {/each}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .mt-rich-text-editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    border: 1px solid #ccc;
    border-bottom: none;
  }
  .mt-rich-text-editor-toolbar-row {
    display: flex;
    flex-wrap: wrap;
    background-image: url("./asset/toolbar-border.svg");
  }
  .mt-rich-text-editor-toolbar-group {
    padding: 0 4px;
  }
  .mt-rich-text-editor-toolbar-group:not(:last-child) {
    border-right: 1px solid #ccc;
    white-space: nowrap;
  }
  .button {
    display: inline-block;
    margin: 2px 0 3px;
    height: 34px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;
    padding: 1px 5px;
  }
  .button:not(.is-disabled):hover {
    background: #dee0e2;
  }
  .button.is-active {
    background: #dee0e2;
  }
  .button.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
