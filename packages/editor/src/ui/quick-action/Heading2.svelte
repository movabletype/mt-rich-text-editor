<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-quick-action-item-h2",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h2", "heading2"];
    };
</script>

<script lang="ts">
  import type { QuickActionItemProps } from "../item/registry/svelte";
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import icon from "../icon/heading2.svg?raw";
  const { tiptap, onAction }: QuickActionItemProps = $props();
  onAction(() => {
    tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h2></h2>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 2")} />
