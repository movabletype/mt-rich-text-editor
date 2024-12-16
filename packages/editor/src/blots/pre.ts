import Block from "quill/blots/block";

export class PreBlot extends Block {
  static blotName = "pre";
  static tagName = "pre";

  static formats() {
    return true;
  }
}
