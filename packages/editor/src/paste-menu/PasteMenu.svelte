<script lang="ts">
  import type { Editor } from "../editor";
  import type { EditorView } from "@tiptap/pm/view";
  import { getPanelItem } from "../ui/item/registry";
  import type { PasteMenuItemElement, PasteMenuItemPriorityValue } from "./item/element";
  import clipboardIcon from "../ui/icon/clipboard.svg?raw";
  import normalizeExternalHTML from "quill/modules/normalizeExternalHTML";
  import { INTERNAL_PASTE_CONTENT_TYPE } from "./item";

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
    setIsPasting,
  }: {
    editor: Editor;
    pasteMenu: string[];
    onPaste: (callback: (view: EditorView, event: ClipboardEvent) => boolean) => void;
    options: Record<string, Record<string, unknown> | undefined | false>;
    setIsPasting: (isPasting: boolean) => void;
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
    options: Record<string, unknown>;
  }[];

  let isOpen = $state(false);
  let isMenuOpen = $state(false);
  let isInTransaction = false;
  let top = $state(0);
  let left = $state(0);
  let menuElement: HTMLElement | null = null;
  const isAvailableMap: Record<string, number> = $state({});

  $effect(() => {
    setIsPasting(isOpen);
  });

  editor.tiptap.on("update", () => {
    if (!isInTransaction) {
      isOpen = false;
    }
  });

  const tryUpdatePosition = (view: EditorView, byScroll: boolean = false) => {
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
      if (left !== 0 && left > newLeft) {
        left = newLeft;
      }
      return;
    }

    // Get the actual rendered size of the node and update position
    const updateNodePosition = (resizeObserver: ResizeObserver | undefined = undefined) => {
      if (!domNode.parentElement) {
        resizeObserver?.disconnect();
        return;
      }

      const nodeRect = domNode.getBoundingClientRect();
      const tmpTop = nodeRect.bottom - viewRect.top;
      const newTop = tmpTop > viewRect.height - 20 ? viewRect.height - 20 : tmpTop;
      if (byScroll || top < newTop || top - newTop > 100) {
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
      const resizeObserver = new ResizeObserver(() => {
        updateNodePosition(resizeObserver);
      });
      resizeObserver.observe(domNode);

      // Stop observing after 10 seconds
      setTimeout(() => {
        resizeObserver.disconnect();
      }, 10000);
    }
  };
  const updatePosition = (view: EditorView, byScroll: boolean = false) => {
    try {
      tryUpdatePosition(view, byScroll);
    } catch {
      // TBD: retry?
    }
  };

  editor.tiptap.view.dom.addEventListener("scroll", () => {
    if (isOpen) {
      updatePosition(editor.tiptap.view, true);
    }
  });

  let applyName = $state("");
  onPaste((view, event) => {
    if (event.clipboardData?.getData(INTERNAL_PASTE_CONTENT_TYPE)) {
      return false; // internal use
    }

    // commit history transaction
    // FIXME: we should more effectively commit history transaction
    editor.tiptap.commands.undo();
    editor.tiptap.commands.redo();

    const targetDomNode = view
      .domAtPos(editor.tiptap.state.selection.from)
      ?.node?.cloneNode(true) as HTMLElement | Text | null;
    if (targetDomNode instanceof HTMLElement) {
      targetDomNode.querySelectorAll("br.ProseMirror-trailingBreak").forEach((br) => {
        br.remove();
      });
    }

    if (!event.clipboardData) {
      return false;
    }
    const clipboardData = event.clipboardData;
    const plainText = getText(clipboardData);
    const htmlText = clipboardData.getData("text/html");
    let htmlDocument = null;
    if (htmlText) {
      htmlDocument = new DOMParser().parseFromString(htmlText, "text/html");
      if (!htmlDocument.body.querySelector("[data-pm-slice]")) {
        normalizeExternalHTML(htmlDocument);
      }
    }

    (async () => {
      top = 0;
      left = plainText?.includes("\n") ? 0 : 9999;

      const availablePromiseMap: Record<
        string,
        boolean | PasteMenuItemPriorityValue | Promise<boolean | PasteMenuItemPriorityValue>
      > = {};
      buttons.forEach(({ name }) => {
        const button = buttonRefs[name];
        if ("onEditorSetPasteContent" in button) {
          button.onEditorSetPasteContent?.({
            plainText: plainText ?? htmlDocument?.body.innerText ?? "",
            htmlDocument,
            targetDomNode,
            clipboardData,
            transaction: async (cb: () => void | Promise<void>) => {
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
          availablePromiseMap[name] = button.isEditorItemAvailable();
        }
      });

      await Promise.all(Object.values(availablePromiseMap));

      let maxPriority = 0;
      applyName = "";
      for (const { name } of buttons) {
        const availableRes = await availablePromiseMap[name];
        isAvailableMap[name] =
          availableRes === true ? 1 : availableRes === false ? 0 : availableRes;
        if (isAvailableMap[name] > maxPriority) {
          maxPriority = isAvailableMap[name];
          applyName = name;
        }
      }

      if (applyName) {
        setIsPasting(true);
        const button = buttonRefs[applyName];
        if ("onEditorPaste" in button) {
          button.onEditorPaste();
        }
      }

      setTimeout(() => {
        if (Object.values(isAvailableMap).filter(Boolean).length <= 1) {
          return;
        }

        isOpen = true;
        updatePosition(view);
      });
    })();

    return false;
  });

  const bindRef = (node: PasteMenuItemElement | HTMLElement, key: string) => {
    buttonRefs[key] = node;
    if ("onEditorInit" in node) {
      node.onEditorInit(editor, (options[key] as Record<string, unknown> | undefined) ?? {});
    }
    return {
      destroy() {
        delete buttonRefs[key];
      },
    };
  };

  const closeMenuByClickOutside = (ev: MouseEvent) => {
    if (document.body.classList.contains("modal-open")) {
      return;
    }
    if (menuElement && (ev.composedPath() as EventTarget[]).includes(menuElement)) {
      return;
    }
    isMenuOpen = false;
  };

  $effect(() => {
    if (isMenuOpen) {
      document.addEventListener("click", closeMenuByClickOutside);
    }

    return () => {
      document.removeEventListener("click", closeMenuByClickOutside);
    };
  });
</script>

<div
  class="paste-menu"
  style={`
    display: ${isOpen ? "block" : "none"};
    z-index: 1000;
    top: ${top}px;
    left: ${left}px;
    width: max-content;
  `}
  bind:this={menuElement}
>
  <button
    type="button"
    class={`paste-menu-icon ${isMenuOpen ? "is-active" : ""}`}
    onclick={() => (isMenuOpen = !isMenuOpen)}
  >
    {@html clipboardIcon}
  </button>
  <div class="paste-menu-list" style={`display: ${isMenuOpen ? "block" : "none"};`}>
    {#each buttons as button (button.name)}
      <div
        class="paste-menu-item-container"
        class:is-applied={applyName === button.name}
        onpaste-menu-item-applied={() => {
          applyName = button.name;
        }}
      >
        <svelte:element
          this={button.elementName}
          use:bindRef={button.name}
          class="paste-menu-item"
          style={`display: ${isAvailableMap[button.name] ? "block" : "none"};`}
        />
      </div>
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
    background: #fff;
  }
  .paste-menu-item-container {
    position: relative;
  }
  .paste-menu-item-container.is-applied::before {
    content: "✔";
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
