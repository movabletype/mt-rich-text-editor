import type { Editor } from "./editor";
import LinkMenuUI from "./ui/LinkMenu.svelte";
import { mount, unmount } from "svelte";

export class LinkMenu {
  private ui: ReturnType<typeof mount> | undefined;

  constructor({ editor, edit }: { editor: Editor; edit: () => void }) {
    this.ui = mount(LinkMenuUI, {
      target: editor.tiptap.view.dom.getRootNode() as ShadowRoot,
      props: {
        editor,
        edit
      },
    });
  }

  public destroy(): void {
    if (this.ui) {
      unmount(this.ui);
    }
  }
}
