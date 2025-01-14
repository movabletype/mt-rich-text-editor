<script lang="ts">
  import type { Editor } from "../editor";
  import { debounce } from "../util/event";
  import { getPanelItem, EditorEventType, EditorEvent } from "./item/registry";

  const {
    editor,
    toolbar,
    options,
    inline,
  }: {
    editor: Editor;
    toolbar: string[][][][];
    options: Record<string, any>;
    inline: boolean;
  } = $props();

  let toolbarRef: HTMLElement | null = null;

  const buttonRefs: Record<string, HTMLElement> = {};
  const buttons = toolbar
    .map((row) =>
      row.map(
        (
          groupSides // left side and right side
        ) =>
          (groupSides || [])
            .map(
              (group) =>
                (group || [])
                  .map((name) => ({
                    name,
                    elementName: getPanelItem("toolbar", name),
                    options: options[name] ?? {},
                  }))
                  .filter((item) => item.elementName && item.options !== false) as {
                  name: string;
                  elementName: string;
                  options: Record<string, any>;
                }[]
            )
            .filter((group) => group.length > 0)
      )
    )
    .filter((row) => row.length > 0);
  const isActiveMap: Record<string, boolean> = $state({});
  const isDisabledMap: Record<string, boolean> = $state({});
  function update() {
    for (const key in buttonRefs) {
      if (buttonRefs[key].onEditorUpdate) {
        buttonRefs[key].onEditorUpdate(editor);
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

  if (inline) {
    const updateToolbarVisibility = debounce(() => {
      if (!toolbarRef) {
        return;
      }

      let isShow = false;
      let isNewLine = false;
      if (editor.tiptap.state.selection.empty) {
        const node = editor.tiptap.state.selection.$head.parent;
        isShow = node.type.name === "paragraph" && node.content.size === 0;
        isNewLine = true;
      } else {
        isShow = true;
      }

      if (!isShow) {
        toolbarRef.style.display = "";
        toolbarRef.style.transition = "";
        return;
      }

      if (toolbarRef.style.display === "") {
        toolbarRef.style.display = "block";
        setTimeout(() => {
          if (toolbarRef) {
            toolbarRef.style.transition = "left 0.2s ease-in-out";
          }
        }, 100);
      }
      const viewRect = editor.tiptap.view.dom.getBoundingClientRect();
      const { selection } = editor.tiptap.view.state;
      const toCoords = editor.tiptap.view.coordsAtPos(selection.$to.pos);
      if (isNewLine) {
        toolbarRef.style.top = `${toCoords.bottom - viewRect.top - 30}px`;
        toolbarRef.style.left = `${toCoords.left - viewRect.left + 20}px`;
        toolbarRef.setAttribute("data-is-new-line", "true");
      } else {
        const fromCoords = editor.tiptap.view.coordsAtPos(selection.$from.pos);
        const coords = fromCoords.left < toCoords.left ? fromCoords : toCoords;
        toolbarRef.style.top = `${coords.bottom - viewRect.top + 15}px`;
        toolbarRef.style.left = `${coords.left - viewRect.left}px`;
        toolbarRef.removeAttribute("data-is-new-line");
      }
    }, 50);

    editor.tiptap.on("selectionUpdate", updateToolbarVisibility);
    updateToolbarVisibility();
  }

  function bindRef(node: HTMLElement, key: string) {
    buttonRefs[key] = node;
    if (buttonRefs[key].onEditorInit) {
      buttonRefs[key].onEditorInit(editor, options[key]);
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

<div class="toolbar {inline ? 'toolbar--inline' : ''}" bind:this={toolbarRef}>
  {#each buttons as row}
    <div class="toolbar-row">
      {#each row as groupSides}
        <div class="toolbar-side">
          {#each groupSides as group}
            <div
              class={`toolbar-group ${group.length === 1 ? `toolbar-group--${group[0].name}` : ""}`}
            >
              {#each group as button}
                <svelte:element
                  this={button.elementName}
                  use:bindRef={button.name}
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
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
  }
  .toolbar-row:last-child {
    border-bottom: none;
  }
  .toolbar-side {
    display: flex;
    flex-wrap: wrap;
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

  /**
   * Inline
   */
  .toolbar--inline {
    position: absolute;
    display: none;
    z-index: 1;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
  }

  .toolbar--inline::before {
    content: "";
    position: absolute;
    z-index: -1;
    top: 50%;
    left: -8px;
    width: 14px;
    height: 14px;
    background: #fff;
    transform: translateY(-50%) rotate(45deg);
    border-left: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    box-shadow: -1px 1px 2px rgba(0, 0, 0, 0.03);
  }

  .toolbar--inline:not([data-is-new-line])::before {
    content: "";
    position: absolute;
    z-index: -1;
    top: -8px;
    left: 20px;
    width: 14px;
    height: 14px;
    background: #fff;
    transform: translateX(-50%) rotate(45deg);
    border-left: 1px solid #ccc;
    border-top: 1px solid #ccc;
    border-bottom: none;
    box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.03);
  }
</style>
