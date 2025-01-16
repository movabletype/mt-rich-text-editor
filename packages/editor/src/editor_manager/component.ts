import { getPanelItem,  PanelItemElement, PasteMenuItemElement, QuickActionItemElement } from "../ui/item/registry";

export class Component {
  public static PanelItemElement = PanelItemElement;
  public static PasteMenuItemElement = PasteMenuItemElement;
  public static QuickActionItemElement = QuickActionItemElement;
  public static getPanelItem(
    namespace: Parameters<typeof getPanelItem>[0],
    name: string
  ): string | undefined {
    return getPanelItem(namespace, name);
  }
}
