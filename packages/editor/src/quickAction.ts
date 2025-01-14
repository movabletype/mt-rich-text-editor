import type { Editor } from "./editor";
import QuickActionUI from "./ui/QuickAction.svelte";
import { mount, unmount } from "svelte";

interface QuickActionOptions {
  target: HTMLDivElement;
  editor: Editor;
  quickAction: string[];
  options: Record<string, any>;
}

export class QuickAction {
  private quickActionMenu: ReturnType<typeof mount> | undefined;

  constructor({ target, editor, quickAction, options }: QuickActionOptions) {
    if (quickAction.length === 0) {
      return;
    }

    this.quickActionMenu = mount(QuickActionUI, {
      target,
      props: {
        editor,
        quickAction,
        options,
      },
    });
  }

  public destroy(): void {
    if (this.quickActionMenu) {
      unmount(this.quickActionMenu);
    }
  }
}
