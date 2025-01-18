<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendToolbarItem } from "../svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendToolbarItem(customElementConstructor) {
      onEditorUpdate() {
        this.classList.toggle("is-active", this.tiptap?.isActive("link"));
      }
    };
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { toKeyboardShortcutLabel } from "../../../util/keyboardShortcut";
  import icon from "../../../ui/icon/link.svg?raw";
  import { tooltip } from "../../../ui/tooltip";
  import { LinkToolbar } from "../../../context-toolbar/link";
  import type { ToolbarItemElement } from "../element";
  import { onClickFunction } from "./common";

  const element = $host<ToolbarItemElement>();
  const { editor, tiptap } = element;
  const onClick = onClickFunction(tiptap);

  element.addEventListener("click", onClick);

  let menu: LinkToolbar | undefined;
  $effect(() => {
    if (editor) {
      menu = new LinkToolbar({ editor });
      editor.tiptap?.commands.setInlineLinkShortcutHandler(onClick);
    }
    return () => {
      menu?.destroy();
    };
  });
</script>

<button use:tooltip={`${t("Link")} (${toKeyboardShortcutLabel("cmd+K")})`}>
  {@html icon}
</button>
