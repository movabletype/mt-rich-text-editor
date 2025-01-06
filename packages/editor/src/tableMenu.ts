import type { Editor } from "./editor";
import TableMenuUI from "./ui/TableMenu.svelte";
import { mount, unmount } from "svelte";

export class TableMenu {
  private ui: ReturnType<typeof mount> | undefined;

  constructor({ editor }: { editor: Editor }) {
    this.ui = mount(TableMenuUI, {
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
