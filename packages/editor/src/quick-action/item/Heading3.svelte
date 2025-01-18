<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "./svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h3", "heading3"];
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import type { QuickActionItemElement } from "../item/element";
  import icon from "../../ui/icon/heading3.svg?raw";
  const element = $host<QuickActionItemElement>();
  element.addEventListener("click", () => {
    element.tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h3></h3>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 3")} />
