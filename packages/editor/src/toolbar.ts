import type { Editor } from "@tiptap/core";
import ToolbarUI from "./ui/Toolbar.svelte";
import { mount, unmount } from "svelte";

interface ToolbarOptions {
  target: HTMLDivElement;
  editor: Editor;
  toolbar: string[][][];
  options: Record<string, any>;
  inline: boolean;
}

export class Toolbar {
  private toolbar: ReturnType<typeof mount> | undefined;

  constructor({ target, editor, toolbar, options, inline }: ToolbarOptions) {
    if (toolbar.length === 0) {
      return;
    }

    this.toolbar = mount(ToolbarUI, {
      target,
      props: {
        editor,
        toolbar,
        inline,
        options,
      },
    });
  }

  public destroy(): void {
    if (this.toolbar) {
      unmount(this.toolbar);
    }
  }
}
