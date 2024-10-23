import Image from "quill/formats/image";

export class ImageBlot extends Image {
  static create(value: string) {
    const node = super.create(value) as HTMLElement;
    node.setAttribute("contenteditable", "false");
    node.addEventListener("click", (event) => {
      console.log("image click");
      event.preventDefault();
    });
    return node;
  }
}
