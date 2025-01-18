import type { Editor } from "../../editor";
import Toolbar from "./Toolbar.svelte";
import { mount, unmount } from "svelte";

export class LinkToolbar {
  private ui: ReturnType<typeof mount> | undefined;

  constructor({ editor }: { editor: Editor }) {
    this.ui = mount(Toolbar, {
      target: editor.tiptap.view.dom.getRootNode() as ShadowRoot,
      props: {
        editor,
      },
    });
  }

  public destroy(): void {
    if (this.ui) {
      unmount(this.ui);
    }
  }
}
