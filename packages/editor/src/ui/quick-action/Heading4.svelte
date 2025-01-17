<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-quick-action-item-h4",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h4", "heading4"];
    };
</script>

<script lang="ts">
  import type { QuickActionItemProps } from "../item/registry/svelte";
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import icon from "../icon/heading4.svg?raw";
  const { tiptap }: QuickActionItemProps = $props();
  $host().addEventListener("click", () => {
    tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h4></h4>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 4")} />
