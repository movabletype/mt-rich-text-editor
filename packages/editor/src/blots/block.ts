import Block from "quill/blots/block";

export class BlockBlot extends Block {
  static blotName = "block";
  static tagName = "P";

  static create(value: any) {
    const node = super.create() as HTMLElement;

    if (typeof value === "object" && value !== null) {
      Object.keys(value).forEach((key) => {
        if (key !== "text") {
          node.setAttribute(key, value[key]);
        }
      });
    }

    return node;
  }

  static value(node: HTMLElement) {
    const attributes = Array.from(node.attributes).reduce(
      (acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      },
      {} as Record<string, string>
    );

    return Object.keys(attributes).length ? attributes : false;
  }

  static formats(node: HTMLElement) {
    return node.getAttribute("class");
  }

  format(name: string, value: string) {
    if (name === "block") {
      if (value) {
        this.domNode.setAttribute("class", value);
      } else {
        this.domNode.removeAttribute("class");
      }
    } else {
      super.format(name, value);
    }
  }
}
