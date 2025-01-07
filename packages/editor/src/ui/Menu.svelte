<script lang="ts">
  import type { Editor } from "../editor";
  import type { EditorView } from "@tiptap/pm/view";
  import type { Snippet } from "svelte";
  import { findParentNode } from "@tiptap/core";
  const {
    editor,
    children,
    condition,
    targetNodeName,
  }: {
    editor: Editor;
    children: Snippet;
    condition: () => boolean;
    targetNodeName: string;
  } = $props();

  const tiptap = editor.tiptap;
  const viewDom = tiptap.view.dom;

  let isOpen = $state(false);
  let top = $state(0);
  let left = $state(0);
  let menuElement: HTMLElement;
  let showInBottom = $state(false);

  tiptap.on("selectionUpdate", () => {
    isOpen = condition();
    if (isOpen) {
      updatePosition(tiptap.view);
    }
  });
  tiptap.on("update", () => {
    isOpen = condition();
    if (isOpen) {
      updatePosition(tiptap.view);
    }
  });

  const updatePosition = (view: EditorView) => {
    const viewRect = view.dom.getBoundingClientRect();
    const { selection } = view.state;

    const targetPos = findParentNode((node) => node.type.name === targetNodeName)(selection);
    if (!targetPos) {
      top = 0;
      left = 0;
      return;
    }

    const targetDom = view.nodeDOM(targetPos.pos) as HTMLElement;
    if (!targetDom) {
      top = 0;
      left = 0;
      return;
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

    const menuWidth = menuElement?.offsetWidth || 0;
    const menuHeight = menuElement?.offsetHeight || 0;
    const targetWidth = targetDom.offsetWidth;

    const topPosition = targetRect.top - viewRect.top - menuHeight - 10;
    const bottomPosition = targetRect.bottom - viewRect.top + 10;

    showInBottom = topPosition < 0;

    top = showInBottom ? bottomPosition : topPosition;
    left = targetRect.left - viewRect.left + targetWidth / 2 - menuWidth / 2;
  };

  $effect(() => {
    viewDom.addEventListener("scroll", () => {
      if (isOpen) {
        updatePosition(tiptap.view);
      }
    });

    if (isOpen) {
      updatePosition(tiptap.view);
    }
  });
</script>

<div
  bind:this={menuElement}
  class={`menu ${showInBottom ? "menu--bottom" : "menu--top"}`}
  style={`
    display: ${isOpen && top && left ? "flex" : "none"}; 
    top: ${top}px; 
    left: ${left}px;
  `}
>
  {@render children()}
</div>

<style>
  .menu {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ccc;
    z-index: 1;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    gap: 5px;
  }

  .menu::after,
  .menu::before {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
  }

  /* Arrow at the bottom */
  .menu--top::before {
    bottom: -9px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #ccc;
  }

  .menu--top::after {
    bottom: -7px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid #fff;
  }

  /* Arrow at the top */
  .menu--bottom::before {
    top: -9px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #ccc;
  }

  .menu--bottom::after {
    top: -7px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid #fff;
  }
</style>
