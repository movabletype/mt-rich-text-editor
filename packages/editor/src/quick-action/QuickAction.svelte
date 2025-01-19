<script lang="ts">
  import type { Editor } from "../editor";
  import { debounce } from "../util/event";
  import { getPanelItem } from "../ui/item/registry";

  const {
    editor,
    quickAction,
    options,
  }: {
    editor: Editor;
    quickAction: string[];
    options: Record<string, any>;
  } = $props();

  const buttonRefs: Record<string, HTMLElement> = {};
  const buttons = quickAction
    .map((name) => {
      const [baseName, variant] = name.split(":");
      return {
        name,
        variant,
        elementName: getPanelItem("quick-action", baseName),
        aliases: [variant],
        options: options[name] ?? {},
      };
    })
    .filter((item) => item.elementName && item.options !== false) as {
    name: string;
    variant?: string;
    elementName: string;
    aliases: string[];
    options: Record<string, any>;
  }[];

  let keyword = $state<string>("");
  const availableButtons = $derived(
    keyword
      ? buttons.filter((button) =>
          button.aliases.some((alias: string) => alias.startsWith(keyword))
        )
      : buttons
  );
  const availableButtonsLength = $derived(availableButtons.length);

  let selectedButtonIndex = $state<number>(0);
  $effect(() => {
    if (availableButtonsLength > 0) {
      selectedButtonIndex = 0;
    }
  });

  let isShow = false;
  let quickActionRef: HTMLElement | null = null;
  const updateVisibility = debounce(() => {
    if (!quickActionRef) {
      return;
    }

    isShow = false;
    if (editor.tiptap.state.selection.empty) {
      const node = editor.tiptap.state.selection.$head.parent;
      isShow = node.type.name === "paragraph" && node.textContent?.startsWith("/");
      if (isShow) {
        keyword = node.textContent?.slice(1);
      }
    }

    if (!isShow) {
      quickActionRef.style.display = "";
      quickActionRef.style.transition = "";
      return;
    }

    if (quickActionRef.style.display === "") {
      quickActionRef.style.display = "block";
      setTimeout(() => {
        if (quickActionRef) {
          quickActionRef.style.transition = "left 0.2s ease-in-out";
        }
      }, 100);
    }
    const viewRect = editor.tiptap.view.dom.getBoundingClientRect();
    const { selection } = editor.tiptap.view.state;
    const toCoords = editor.tiptap.view.coordsAtPos(selection.$to.pos);

    quickActionRef.style.top = `${toCoords.bottom - viewRect.top + 10}px`;
    // quickActionRef.style.left = `${toCoords.left - viewRect.left}px`;
    quickActionRef.style.left = "0px";
  }, 50);

  $effect(() => {
    editor.tiptap.on("selectionUpdate", updateVisibility);
    updateVisibility();
    editor.tiptap.view.dom.addEventListener(
      "keydown",
      (ev: KeyboardEvent) => {
        if (isShow) {
          if (ev.key === "Enter") {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            buttonRefs[availableButtons[selectedButtonIndex].name].click();
          } else if (ev.key === "ArrowDown") {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            selectedButtonIndex = (selectedButtonIndex + 1) % availableButtons.length;
          } else if (ev.key === "ArrowUp") {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            selectedButtonIndex =
              (selectedButtonIndex - 1 + availableButtons.length) % availableButtons.length;
          }
        }
      },
      { capture: true }
    );
  });

  function bindRef(node: HTMLElement, key: string) {
    buttonRefs[key] = node;
    if ("onEditorInit" in node) {
      (node as any).onEditorInit(editor, options[key]);
    }
    if ("aliases" in node) {
      const button = buttons.find((button) => button.name === key);
      if (button) {
        button.aliases = node.aliases as string[];
      }
    }
    return {
      destroy() {
        delete buttonRefs[key];
      },
    };
  }
</script>

<div class="mt-rich-text-editor-quick-action" bind:this={quickActionRef}>
  {#each availableButtons as button, index (button.name)}
    <div
      class="mt-rich-text-editor-quick-action-button {index === selectedButtonIndex
        ? 'selected'
        : ''}"
    >
      <svelte:element
        this={button.elementName}
        data-mt-rich-text-editor-panel-item-variant={button.variant}
        use:bindRef={button.name}
      />
    </div>
  {/each}
</div>

<style>
  .mt-rich-text-editor-quick-action {
    position: absolute;
    z-index: 1;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    display: none;
  }

  .mt-rich-text-editor-quick-action-button {
    padding: 10px;
    display: block;
    &.selected,
    &:hover {
      background: #f0f0f0;
    }
  }
</style>
