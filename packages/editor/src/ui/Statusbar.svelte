<script lang="ts">
  import type { Editor } from "../editor";
  import { getPanelItem } from "./item/registry";
  import type { StatusbarItemElement } from "./item/element";

  const {
    editor,
    statusbar,
    options,
  }: {
    editor: Editor;
    statusbar: string[][];
    options: Record<string, any>;
  } = $props();

  const buttonRefs: Record<string, StatusbarItemElement | HTMLElement> = {};
  const buttons = statusbar.map(
    (
      groupSides // left side and right side
    ) =>
      (groupSides || [])
        .map((name) => ({
          name,
          elementName: getPanelItem("statusbar", name),
          options: options[name] ?? {},
        }))
        .filter((item) => item.elementName && item.options !== false) as {
        name: string;
        elementName: string;
        options: Record<string, any>;
      }[]
  );
  const isActiveMap: Record<string, boolean> = $state({});
  const isDisabledMap: Record<string, boolean> = $state({});
  function update() {
    for (const key in buttonRefs) {
      if ("onEditorUpdate" in buttonRefs[key]) {
        buttonRefs[key].onEditorUpdate();
      }
      isActiveMap[key] = buttonRefs[key].classList.contains("is-active");
      isDisabledMap[key] = buttonRefs[key].classList.contains("is-disabled");
    }
  }
  editor.tiptap.on("selectionUpdate", update);
  editor.tiptap.on("update", update);
  $effect(() => {
    update();
  });

  function bindRef(node: StatusbarItemElement | HTMLElement, key: string) {
    buttonRefs[key] = node;
    if ("onEditorInit" in node) {
      node.onEditorInit(editor, options[key]);
    }
    return {
      destroy() {
        delete buttonRefs[key];
      },
    };
  }
</script>

<div class="statusbar">
  {#each buttons as groupSides}
    <div class="statusbar-side">
      {#each groupSides as button}
        <svelte:element
          this={button.elementName}
          use:bindRef={button.name}
          class="statusbar-item"
          class:is-active={isActiveMap[button.elementName]}
          class:is-disabled={isDisabledMap[button.elementName]}
          role="button"
          tabindex="0"
          onclick={update}
        />
      {/each}
    </div>
  {/each}
</div>

<style>
  .statusbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .statusbar-side {
    display: flex;
    flex-wrap: wrap;
  }
  .statusbar-item {
    display: inline-flex;
    align-items: center;
    margin: 2px 0 3px;
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
