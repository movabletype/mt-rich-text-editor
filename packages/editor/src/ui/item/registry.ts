import toolbar from "../../toolbar/item";
import statusbar from "../../statusbar/item";
import pasteMenu from "../../paste-menu/item";
import quickAction from "../../quick-action/item";

type PanelNamespace = "toolbar" | "statusbar" | "paste-menu" | "quick-action";

const systemItems: Record<PanelNamespace, Record<string, typeof HTMLElement>> = {
  toolbar,
  statusbar,
  "paste-menu": pasteMenu,
  "quick-action": quickAction,
};

export const getPanelItem = (namespace: PanelNamespace, name: string): string | undefined => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("-") && window.customElements.get(lowerName)) {
    // specified by full name
    return lowerName;
  }

  const elementName = `mt-rich-text-editor-${namespace}-item-${lowerName}`;
  let elementConstructor = window.customElements.get(elementName);
  if (!elementConstructor) {
    elementConstructor = systemItems[namespace][name];
    if (!elementConstructor) {
      console.error(`Item for ${name} is not found`);
      return undefined;
    }
    window.customElements.define(elementName, elementConstructor);
  }
  return elementName;
};
