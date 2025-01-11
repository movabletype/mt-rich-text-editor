import type { Editor } from "./editor";
import ImageMenuUI from "./ui/ImageMenu.svelte";
import { mount, unmount } from "svelte";

export class ImageMenu {
  private ui: ReturnType<typeof mount> | undefined;

  constructor({ editor, edit }: { editor: Editor, edit?: (options: {editor: Editor, element: HTMLElement}) => void }) {
    this.ui = mount(ImageMenuUI, {
      target: editor.tiptap.view.dom.getRootNode() as ShadowRoot,
      props: {
        editor,
        edit,
      },
    });
  }

  public destroy(): void {
    if (this.ui) {
      unmount(this.ui);
    }
  }
}
