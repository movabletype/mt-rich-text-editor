<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-quick-action-item-h6",
    extend: extend,
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
  import type { QuickActionItemProps } from "../item/registry/svelte";
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import icon from "../icon/heading6.svg?raw";
  const { tiptap, onAction }: QuickActionItemProps = $props();
  onAction(() => {
    tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h6></h6>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 6")} />
