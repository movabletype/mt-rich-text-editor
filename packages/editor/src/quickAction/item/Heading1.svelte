<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendQuickActionItem } from "./svelte";
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendQuickActionItem(customElementConstructor) {
      aliases = ["h1", "heading1"];
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import HeadingCommon from "./HeadingCommon.svelte";
  import type { QuickActionItemElement } from "./element";
  import icon from "../../ui/icon/heading1.svg?raw";

  const element = $host<QuickActionItemElement>();
  element.addEventListener("click", () => {
    element.tiptap
      ?.chain()
      .focus()
      .selectParentNode()
      // .deleteSelection()
      .insertContent(`<h1></h1>`)
      .run();
  });
</script>

<HeadingCommon {icon} label={t("Heading 1")} />
