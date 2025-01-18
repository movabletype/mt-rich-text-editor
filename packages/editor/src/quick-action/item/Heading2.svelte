<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "./svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h2", "heading2"];
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import type { QuickActionItemElement } from "../item/element";
  import icon from "../../ui/icon/heading2.svg?raw";
  const element = $host<QuickActionItemElement>();
  element.addEventListener("click", () => {
    element.tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h2></h2>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 2")} />
