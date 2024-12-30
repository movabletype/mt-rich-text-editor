<script lang="ts">
  import type { Editor } from "../editor";
  import { getPanelItem, EditorEventType, EditorEvent } from "./item/registry";

  const {
    editor,
    statusbar,
    options,
  }: {
    editor: Editor;
    statusbar: string[][][];
    options: Record<string, any>;
  } = $props();

  const buttonRefs: Record<string, HTMLElement> = {};
  const buttons = statusbar
    .map((row) =>
      row
        .map((group) =>
          group
            .map((name) => ({
              name,
              elementName: getPanelItem("statusbar", name),
              options: options[name] ?? {},
            }))
            .filter((item) => item.elementName && item.options !== false)
        )
        .filter((group) => group.length > 0)
    )
    .filter((row) => row.length > 0);
  const isActiveMap: Record<string, boolean> = $state({});
  const isDisabledMap: Record<string, boolean> = $state({});
  function update() {
    for (const key in buttonRefs) {
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

<div class="statusbar">
  {#each buttons as row}
    <div class="statusbar-row">
      {#each row as group}
        <div
          class={`statusbar-group ${group.length === 1 ? `statusbar-group--${group[0].name}` : ""}`}
        >
          {#each group as button}
            <svelte:element
              this={button.elementName}
              use:bindRef={button.elementName}
              data-options={JSON.stringify(button.options)}
              class="statusbar-item"
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
  .statusbar {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    height: 34px;
  }
  .statusbar-row {
    display: flex;
    flex-wrap: wrap;
  }
  .statusbar-group {
    padding: 0 4px;
  }
  .statusbar-group:not(:last-child) {
    border-right: 1px solid #ccc;
    white-space: nowrap;
  }
  .statusbar-item {
    display: inline-block;
    margin: 2px 0 3px;
    height: 34px;
    border: none;
    background: none;
    border-radius: 4px;
    padding: 1px 5px;
  }
  .statusbar-item.is-active {
    background: #dee0e2;
  }
  .statusbar-item.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
