<svelte:options
  customElement={{
    tag: "mt-rich-text-editor-quick-action-item-h1",
    extend: extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "../item/registry/svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h1", "heading1"];
    };
</script>

<script lang="ts">
  import type { QuickActionItemProps } from "../item/registry/svelte";
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import icon from "../icon/heading1.svg?raw";
  const { tiptap }: QuickActionItemProps = $props();
  $host().addEventListener("click", () => {
    tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h1></h1>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 1")} />
