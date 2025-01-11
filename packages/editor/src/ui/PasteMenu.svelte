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

  const updatePosition = (view: EditorView, byScroll: boolean = false) => {
    const viewRect = view.dom.getBoundingClientRect();
    const { selection } = view.state;

    // Get the DOM node at cursor position
    const pos = selection.$to.pos;
    const domNode = view.nodeDOM(selection.$from.pos - 2) as HTMLElement;

    if (!domNode) {
      // Fallback to coordsAtPos if we can't get the DOM node
      const coords = view.coordsAtPos(pos);
      const newTop = coords.bottom - viewRect.top;
      if (top < newTop || top - newTop > 100) {
        top = newTop;
      }
      const newLeft = coords.left - viewRect.left;
      if (left > newLeft) {
        left = newLeft;
      }
      return;
    }

    // Get the actual rendered size of the node and update position
    const updateNodePosition = () => {
      const nodeRect = domNode.getBoundingClientRect();
      const tmpTop = nodeRect.bottom - viewRect.top;
      const newTop = tmpTop > viewRect.height - 20 ? viewRect.height - 20 : tmpTop;
      if (byScroll ||top < newTop || top - newTop > 100) {
        top = newTop;
      }
      const newLeft = nodeRect.left - viewRect.left;
      if (byScroll || left > newLeft) {
        left = newLeft;
      }
    };

    // Initial position update
    updateNodePosition();

    if (!byScroll) {
      const resizeObserver = new ResizeObserver(updateNodePosition);
      resizeObserver.observe(domNode);

      // Stop observing after 10 seconds
      setTimeout(() => {
        resizeObserver.disconnect();
      }, 10000);
    }
  };

  editor.tiptap.view.dom.addEventListener("scroll", () => {
    if (isOpen) {
      updatePosition(editor.tiptap.view, true);
    }
  });

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
    for (const { name } of buttons) {
      const button = buttonRefs[name];
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
        isAvailableMap[name] = button.isEditorItemAvailable();
      }
      if (!applied && isAvailableMap[name]) {
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
      node.onEditorInit(editor, options[key]);
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
  style={`display: ${isOpen ? "block" : "none"}; top: ${top}px; left: ${left}px;`}
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
        use:bindRef={button.name}
        onclick={function (ev) {
          ev.preventDefault();
          ev.stopPropagation();

          if ("onEditorPaste" in this) {
            (this as unknown as PasteMenuItemElement).onEditorPaste();
          }
        }}
        role="button"
        tabindex="0"
        class="paste-menu-item"
        style={`display: ${isAvailableMap[button.name] ? "block" : "none"};`}
      />
    {/each}
  </div>
</div>

<style>
  .paste-menu {
    position: absolute;
    z-index: 1;
  }
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
    background: #fff;
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
    background: #fff;
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
