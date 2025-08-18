<script lang="ts">
  import { WINDOW_EDGE_MARGIN } from "../constant";
  import type { Editor } from "../editor";
  import type { EditorView } from "@tiptap/pm/view";
  import { findParentNode } from "@tiptap/core";
  import type { ToolbarItemElement } from "../toolbar/item/element";
  import { getPanelItem } from "../ui/item/registry";

  const {
    editor,
    condition,
    targetNodeName,
    targetNodeTagName,
    items,
  }: {
    editor: Editor;
    condition: () => boolean;
    targetNodeName: string;
    targetNodeTagName: string;
    items: string[][];
  } = $props();

  const tiptap = editor.tiptap;
  const viewDom = tiptap.view.dom;

  const buttonRefs: Record<string, HTMLElement> = {};
  const buttons = items.map((item) => {
    return item.map((name) => {
      return {
        name,
        elementName: getPanelItem("toolbar", name),
        icon: name,
      };
    });
  });

  let isOpen = $state(false);
  let top = $state(0);
  let left = $state(0);
  let toolbarElement: HTMLElement;
  let showInBottom = $state(false);

  const update = () => {
    isOpen = !editor.getStructureMode() && condition();
    if (isOpen) {
      updatePosition();
      for (const key in buttonRefs) {
        if ("onEditorUpdate" in buttonRefs[key]) {
          (buttonRefs[key] as ToolbarItemElement).onEditorUpdate();
        }
      }
    }
  };
  tiptap.on("selectionUpdate", update);
  tiptap.on("update", update);

  const tryUpdatePosition = (view: EditorView) => {
    const viewRect = view.dom.getBoundingClientRect();
    const { selection } = view.state;

    let targetDom: HTMLElement | null = null;
    if (tiptap.isActive(targetNodeName)) {
      const resolvedPos = view.domAtPos(selection.from);
      if (resolvedPos.node) {
        targetDom = resolvedPos.node as HTMLElement;
        if (targetDom.nodeType === Node.TEXT_NODE) {
          targetDom = targetDom.parentElement;
        }
      }
      if (targetNodeTagName === "A" && targetDom?.tagName !== "A") {
        const resolvedPos = view.domAtPos(selection.from - 1);
        if (resolvedPos.node) {
          targetDom = resolvedPos.node as HTMLElement;
          if (targetDom.nodeType === Node.TEXT_NODE) {
            targetDom = targetDom.parentElement;
          }
        }
      }

      if (targetDom && targetNodeTagName !== targetDom.tagName) {
        const child = targetDom.querySelector<HTMLElement>(targetNodeTagName);
        if (child) {
          targetDom = child;
        }
      }
    }
    if (!targetDom) {
      const targetPos =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (selection as any).node?.type.name === targetNodeName
          ? selection.$anchor
          : findParentNode((node) => node.type.name === targetNodeName)(selection);
      if (!targetPos) {
        top = 0;
        left = 0;
        return;
      }

      targetDom = view.nodeDOM(targetPos.pos) as HTMLElement;
      if (!targetDom) {
        top = 0;
        left = 0;
        return;
      }
    }

    (async () => {
      if (targetDom instanceof HTMLImageElement && !targetDom.complete) {
        await new Promise((resolve) => {
          targetDom.onload = resolve;
        });
      }

      const targetRect = targetDom.getBoundingClientRect();

      const isVisible =
        targetRect.top < viewRect.bottom &&
        targetRect.bottom > viewRect.top &&
        targetRect.left < viewRect.right &&
        targetRect.right > viewRect.left;

      if (!isVisible) {
        top = 0;
        left = 0;
        return;
      }

      const toolbarWidth = toolbarElement?.offsetWidth || 0;
      const toolbarHeight = toolbarElement?.offsetHeight || 0;
      const targetWidth = targetDom.offsetWidth;

      const topPosition = targetRect.top - viewRect.top - toolbarHeight - 10;
      const bottomPosition = targetRect.bottom - viewRect.top + 10;

      showInBottom = topPosition < 0;

      top = showInBottom ? bottomPosition : topPosition;

      const tmpLeft = targetRect.left - viewRect.left + targetWidth / 2 - toolbarWidth / 2;
      if (tmpLeft + viewRect.left < WINDOW_EDGE_MARGIN) {
        left = WINDOW_EDGE_MARGIN - viewRect.left;
      } else if (tmpLeft + viewRect.left + targetWidth > window.innerWidth - WINDOW_EDGE_MARGIN) {
        left = window.innerWidth - WINDOW_EDGE_MARGIN - viewRect.left - targetWidth;
      } else {
        left = tmpLeft;
      }
    })();
  };
  const updatePosition = () => {
    try {
      tryUpdatePosition(tiptap.view);
    } catch {
      // ignore error
    }
  };

  function bindRef(node: HTMLElement, key: string) {
    buttonRefs[key] = node;
    if ("onEditorInit" in buttonRefs[key]) {
      (buttonRefs[key] as ToolbarItemElement).onEditorInit(editor, {});
    }
    return {
      destroy() {
        delete buttonRefs[key];
      },
    };
  }

  $effect(() => {
    viewDom.addEventListener("scroll", () => {
      if (isOpen) {
        updatePosition();
      }
    });

    if (isOpen) {
      updatePosition();
    }
  });
</script>

<div
  bind:this={toolbarElement}
  class={`toolbar ${showInBottom ? "toolbar--bottom" : "toolbar--top"}`}
  style={`
    display: ${isOpen && (top || left) ? "flex" : "none"};
    background-color: #fff;
    top: ${top}px; 
    left: ${left}px;
  `}
>
  {#each buttons as group, groupIndex (groupIndex)}
    <div class="toolbar-group">
      {#each group as button (button.name)}
        <svelte:element this={button.elementName} use:bindRef={button.name} class="toolbar-item" />
      {/each}
    </div>
  {/each}
</div>

<style>
  .toolbar {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ccc;
    z-index: 1200;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    gap: 5px;
  }

  .toolbar::after,
  .toolbar::before {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
  }

  /* Arrow at the bottom */
  .toolbar--top::before {
    bottom: -9px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #ccc;
  }

  .toolbar--top::after {
    bottom: -7px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid #fff;
  }

  /* Arrow at the top */
  .toolbar--bottom::before {
    top: -9px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #ccc;
  }

  .toolbar--bottom::after {
    top: -7px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid #fff;
  }

  .toolbar-group {
    display: flex;
    gap: 5px;
    padding: 4px;
  }

  .toolbar-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
