<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-quick-action-item-h6",
    extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h6", "heading6"];
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import type { QuickActionItemElement } from "../item/element";
  import icon from "../icon/heading6.svg?raw";
  const element = $host<QuickActionItemElement>();
  element.addEventListener("click", () => {
    element.tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h6></h6>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 6")} />
