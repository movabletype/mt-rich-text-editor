<script lang="ts">
  import type { Editor } from "../editor";
  import type { ToolbarItemElement } from "./item/element";
  import { debounce } from "../util/event";
  import { getPanelItem } from "../ui/item/registry";

  const {
    editor,
    toolbar,
    options,
    inline,
  }: {
    editor: Editor;
    toolbar: string[][][][];
    options: Record<string, Record<string, unknown> | undefined | false>;
    inline: boolean;
  } = $props();

  let toolbarRef: HTMLElement | null = null;

  const buttonRefs: Record<string, ToolbarItemElement | HTMLElement> = {};
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
                  options: Record<string, unknown>;
                }[]
            )
            .filter((group) => group.length > 0)
      )
    )
    .filter((row) => row.length > 0);
  function update() {
    for (const key in buttonRefs) {
      if ("onEditorUpdate" in buttonRefs[key]) {
        buttonRefs[key].onEditorUpdate();
      }
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
      if (!editor.tiptap.isFocused) {
        isShow = false;
      } else if (editor.tiptap.state.selection.empty) {
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
    editor.tiptap.on("focus", updateToolbarVisibility);
    editor.tiptap.on("blur", updateToolbarVisibility);
    updateToolbarVisibility();
  }

  function bindRef(node: ToolbarItemElement | HTMLElement, key: string) {
    buttonRefs[key] = node;
    if ("onEditorInit" in node) {
      node.onEditorInit(editor, ((options[key] as Record<string, unknown>) || undefined) ?? {});
    }
    return {
      destroy() {
        delete buttonRefs[key];
      },
    };
  }
</script>

<div class="toolbar {inline ? 'toolbar--inline' : ''}" bind:this={toolbarRef}>
  {#each buttons as row, rowIndex (rowIndex)}
    <div class="toolbar-row">
      {#each row as groupSides, groupSidesIndex (groupSidesIndex)}
        <div class="toolbar-side">
          {#each groupSides as group, groupIndex (groupIndex)}
            <div
              class={`toolbar-group ${group.length === 1 ? `toolbar-group--${group[0].name}` : ""}`}
            >
              {#each group as button, buttonIndex (buttonIndex)}
                <svelte:element
                  this={button.elementName}
                  use:bindRef={button.name}
                  class="toolbar-item"
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
    position: relative;
  }
  .toolbar-row::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 90%;
    background-image: url("data:image/svg+xml;utf8,<svg width='100%' height='39' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='39' x2='10000' y2='39' stroke='%23ccc' stroke-width='2'/></svg>");
    background-repeat: repeat-y;
    background-size: 100% 39px;
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
    display: flex;
  }
  .toolbar-group:not(:last-child) {
    border-right: 1px solid #ccc;
    white-space: nowrap;
  }
  .toolbar-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 2px 0 3px;
    height: 34px;
  }

  .toolbar-item.is-active {
    background: #dee0e2;
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
