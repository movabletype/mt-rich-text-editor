<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "./svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h5", "heading5"];
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import type { QuickActionItemElement } from "../item/element";
  import icon from "../../ui/icon/heading5.svg?raw";
  const element = $host<QuickActionItemElement>();
  element.addEventListener("click", () => {
    element.tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h5></h5>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 5")} />
