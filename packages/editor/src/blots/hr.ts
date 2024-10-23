import { EmbedBlot } from "parchment";

export class HrBlot extends EmbedBlot {
  static blotName = "hr";
  static tagName = "hr";

  static create() {
    const node = super.create() as HTMLElement;
    // node.setAttribute("contenteditable", "false");
    return node;
  }
}
