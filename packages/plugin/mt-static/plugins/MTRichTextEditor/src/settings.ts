import { mount } from "svelte";
import Toolbar from "./settings/Toolbar.svelte";
import Blocks from "./settings/Blocks.svelte";
import Colors from "./settings/Colors.svelte";

setTimeout(() => {
  [
    {
      id: "toolbar",
      component: Toolbar,
    },
    {
      id: "blocks",
      component: Blocks,
    },
    {
      id: "colors",
      component: Colors,
    },
  ].forEach(({ id: name, component }) => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      `[name="mt_rich_text_editor_${name}"]`
    );
    if (!textarea) {
      throw new Error(`Target element not found: mt_rich_text_editor_${name}`);
    }
    const container = document.createElement("div");
    textarea.parentElement?.insertBefore(container, textarea);
    mount(component, {
      target: container,
      props: {
        textarea,
      },
    });
  });
});
