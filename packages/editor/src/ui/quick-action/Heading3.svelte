<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-quick-action-item-h3",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h3", "heading3"];
    };
</script>

<script lang="ts">
  import type { QuickActionItemProps } from "../item/registry/svelte";
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import icon from "../icon/heading3.svg?raw";
  const { tiptap, onAction }: QuickActionItemProps = $props();
  onAction(() => {
    tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h3></h3>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 3")} />
