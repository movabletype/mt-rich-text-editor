import { EmbedBlot } from "parchment";

export class BaseHTMLBlot extends EmbedBlot {
  static tagName: string | string[] = '';

  static create(value: any) {
    const node = super.create(value.tagName) as HTMLElement;
    if (value.attributes) {
      Object.entries(value.attributes).forEach(([key, val]) => {
        node.setAttribute(key, val as string);
      });
    }
    if (value.innerHTML) {
      node.innerHTML = value.innerHTML;
    }
    return node;
  }

  static value(node: HTMLElement) {
    const attributes: Record<string, string> = {};
    Array.from(node.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    return {
      tagName: node.tagName.toLowerCase(),
      attributes,
      innerHTML: node.innerHTML
    };
  }
} 
