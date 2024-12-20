import type { Editor } from "@tiptap/core";
import StatusbarUI from "./ui/Statusbar.svelte";
import { mount, unmount } from "svelte";

interface StatusbarOptions {
  target: HTMLDivElement;
  editor: Editor;
  statusbar: string[][][];
  options: Record<string, any>;
  inline: boolean;
}

export class Statusbar {
  private statusbar: ReturnType<typeof mount> | undefined;

  constructor({ target, editor, statusbar, options, inline }: StatusbarOptions) {
    if (statusbar.length === 0) {
      return;
    }

    this.statusbar = mount(StatusbarUI, {
      target,
      props: {
        editor,
        statusbar,
        inline,
        options,
      },
    });
  }

  public destroy(): void {
    if (this.statusbar) {
      unmount(this.statusbar);
    }
  }
}
