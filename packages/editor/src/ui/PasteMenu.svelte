<script lang="ts">
  import type { Editor } from "../editor";
  import type { EditorView } from "@tiptap/pm/view";
  import { getPanelItem } from "./item/registry";
  import type { PasteMenuItemElement } from "./item/registry";
  import clipboardIcon from "./icon/clipboard.svg?raw";

  function getText(clipboardData: DataTransfer): string | undefined {
    const text = clipboardData.getData("text/plain") || clipboardData.getData("Text");
    if (text) {
      return text;
    }
    const uris = clipboardData.getData("text/uri-list");
    return uris ? uris.replace(/\r?\n/g, " ") : undefined;
  }

  const {
    editor,
    onPaste,
    pasteMenu,
    options,
  }: {
    editor: Editor;
    pasteMenu: string[];
    onPaste: (callback: (view: EditorView, event: ClipboardEvent) => boolean) => void;
    options: Record<string, any>;
  } = $props();

  const buttonRefs: Record<string, PasteMenuItemElement | HTMLElement> = {};
  const buttons = pasteMenu
    .map((name) => ({
      name,
      elementName: getPanelItem("paste-menu", name),
      options: options[name] ?? {},
    }))
    .filter((item) => item.elementName && item.options !== false) as {
    name: string;
    elementName: string;
    options: Record<string, any>;
  }[];

  let isOpen = $state(false);
  let isMenuOpen = $state(false);
  let isInTransaction = false;
  let top = $state(0);
  let left = $state(0);
  const isAvailableMap: Record<string, boolean> = $state({});

  editor.tiptap.on("update", () => {
    if (!isInTransaction) {
      isOpen = false;
    }
  });

  const updatePosition = (view: EditorView) => {
    const viewRect = view.dom.getBoundingClientRect();
    const { selection } = view.state;
    const coords = view.coordsAtPos(selection.$to.pos);
    const newTop = coords.bottom - viewRect.top;
    if (top < newTop || top - newTop > 100) {
      top = newTop;
    }
    const newLeft = coords.left - viewRect.left;
    if (left > newLeft) {
      left = newLeft;
    }
  };

  onPaste((view, event) => {
    if (!event.clipboardData) {
      return false;
    }
    top = 0;
    left = 0;

    const clipboardData = event.clipboardData;
    const plainText = getText(clipboardData);
    const htmlText = clipboardData.getData("text/html");
    let htmlDocument = null;
    if (htmlText) {
      htmlDocument = new DOMParser().parseFromString(htmlText, "text/html");
    }

    let applied = false;
    for (const { elementName } of buttons) {
      const button = buttonRefs[elementName];
      if ("onEditorSetPasteContent" in button) {
        button.onEditorSetPasteContent?.({
          plainText: plainText ?? htmlDocument?.body.innerText ?? "",
          htmlDocument,
          clipboardData,
          transaction: async (cb: Function) => {
            isInTransaction = true;
            try {
              await cb();
            } finally {
              isInTransaction = false;
              updatePosition(view);
            }
          },
        });
      }
      if ("isEditorItemAvailable" in button) {
        isAvailableMap[elementName] = button.isEditorItemAvailable();
      }
      if (!applied && isAvailableMap[elementName]) {
        setTimeout(() => {
          if ("onEditorPaste" in button) {
            button.onEditorPaste();
          }
        });
        applied = true;
      }
    }

    setTimeout(() => {
      if (Object.values(isAvailableMap).filter(Boolean).length <= 1) {
        return;
      }

      updatePosition(view);
      isOpen = true;
    });

    return false;
  });

  function bindRef(node: PasteMenuItemElement | HTMLElement, key: string) {
    buttonRefs[key] = node;
    if ("onEditorInit" in node) {
      node.onEditorInit(editor);
    }
    return {
      destroy() {
        delete buttonRefs[key];
      },
    };
  }
</script>

<div
  class="paste-menu"
  style={`display: ${isOpen ? "block" : "none"}; position: absolute; top: ${top}px; left: ${left}px;`}
>
  <button
    type="button"
    class={`paste-menu-icon ${isMenuOpen ? "is-active" : ""}`}
    onclick={() => (isMenuOpen = !isMenuOpen)}
  >
    {@html clipboardIcon}
  </button>
  <div class="paste-menu-list" style={`display: ${isMenuOpen ? "block" : "none"};`}>
    {#each buttons as button}
      <svelte:element
        this={button.elementName}
        use:bindRef={button.elementName}
        onclick={function (ev) {
          ev.preventDefault();
          ev.stopPropagation();

          if ("onEditorPaste" in this) {
            (this as unknown as PasteMenuItemElement).onEditorPaste();
          }
        }}
        role="button"
        tabindex="0"
        data-options={JSON.stringify(button.options)}
        class="paste-menu-item"
        style={`display: ${isAvailableMap[button.elementName] ? "block" : "none"};`}
      />
    {/each}
  </div>
</div>

<style>
  .paste-menu-icon {
    background: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 2px;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .paste-menu-icon:after {
    content: "";
    display: block;
    margin: 0 2px;
    width: 6px;
    height: 6px;
    border-right: 1px solid #000;
    border-bottom: 1px solid #000;
    transform: rotate(45deg);
    margin-top: -3px;
  }
  .paste-menu-icon:hover {
    background: #f0f0f0;
  }
  .paste-menu-icon.is-active {
    border-bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    position: relative;
    z-index: 1;
    background: #fff;
  }

  .paste-menu {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
  }
  .paste-menu-list {
    display: flex;
    flex-wrap: wrap;
    border: 1px solid #ccc;
    border-radius: 4px;
    border-top-left-radius: 0;
    margin-top: -1px;
    padding-top: 3px;
  }
  .paste-menu-item {
    display: inline-flex;
    margin: 2px 0 3px 3px;
    line-height: 2;
    border: none;
    background: none;
    border-radius: 4px;
    padding: 0 10px;
  }
  .paste-menu-item:hover {
    background: #f0f0f0;
    cursor: pointer;
  }
  .paste-menu-item.is-active {
    background: #dee0e2;
  }
  .paste-menu-item.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
