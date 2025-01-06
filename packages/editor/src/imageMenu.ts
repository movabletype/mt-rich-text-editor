import type { Editor } from "./editor";
import ImageMenuUI from "./ui/ImageMenu.svelte";
import { mount, unmount } from "svelte";

export class ImageMenu {
  private ui: ReturnType<typeof mount> | undefined;

  constructor({ editor }: { editor: Editor }) {
    this.ui = mount(ImageMenuUI, {
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
