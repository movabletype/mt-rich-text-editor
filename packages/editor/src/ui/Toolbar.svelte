<script lang="ts">
  import type { Editor } from "../editor";
  import { getPanelItem, EditorEventType, EditorEvent } from "./item/registry";

  const {
    editor,
    toolbar,
    options,
  }: {
    editor: Editor;
    toolbar: string[][][];
    options: Record<string, any>;
  } = $props();

  const buttonRefs: Record<string, HTMLElement> = {};
  const buttons = toolbar.map((row) =>
    row.map((group) =>
      group.map((name) => ({
        name,
        elementName: getPanelItem("toolbar", name),
        options: options[name] ?? {},
      }))
    )
  );
  const isActiveMap: Record<string, boolean> = $state({});
  const isDisabledMap: Record<string, boolean> = $state({});
  function update() {
    for (const key in buttonRefs) {
      if (buttonRefs[key].mtRichTextEditorUpdate) {
        buttonRefs[key].mtRichTextEditorUpdate(editor);
      }
      buttonRefs[key].dispatchEvent(new EditorEvent(EditorEventType.Update, editor));
      isActiveMap[key] = buttonRefs[key].classList.contains("is-active");
      isDisabledMap[key] = buttonRefs[key].classList.contains("is-disabled");
    }
  }
  editor.tiptap.on("selectionUpdate", update);
  editor.tiptap.on("update", update);
  $effect(() => {
    update();
  });

  function bindRef(node: HTMLElement, key: string) {
    buttonRefs[key] = node;
    if (buttonRefs[key].mtRichTextEditorInit) {
      buttonRefs[key].mtRichTextEditorInit(editor);
    }
    setTimeout(() => {
      node.dispatchEvent(new EditorEvent(EditorEventType.Init, editor));
    });
    return {
      destroy() {
        delete buttonRefs[key];
      },
    };
  }
</script>

<div class="toolbar">
  {#each buttons as row}
    <div class="toolbar-row">
      {#each row as group}
        <div class={`toolbar-group ${group.length === 1 ? `toolbar-group--${group[0].name}` : ""}`}>
          {#each group as button}
            <svelte:element
              this={button.elementName}
              use:bindRef={button.elementName}
              data-options={JSON.stringify(button.options)}
              class="toolbar-item"
              class:is-active={isActiveMap[button.elementName]}
              class:is-disabled={isDisabledMap[button.elementName]}
              onclick={(ev) => {
                ev.currentTarget.dispatchEvent(new EditorEvent(EditorEventType.Click, editor));
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
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
  }
  .toolbar-row {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid #ccc;
  }
  .toolbar-row:last-child {
    border-bottom: none;
  }
  .toolbar-group {
    padding: 0 4px;
  }
  .toolbar-group:not(:last-child) {
    border-right: 1px solid #ccc;
    white-space: nowrap;
  }
  .toolbar-item {
    display: inline-flex;
    align-items: center;
    margin: 2px 0 3px;
    height: 34px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;
    padding: 1px 5px;
  }
  .toolbar-item:not(.is-disabled):hover {
    background: #dee0e2;
  }
  .toolbar-item.is-active {
    background: #dee0e2;
  }
  .toolbar-item.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
