import { getPanelItem } from "../ui/item/registry";

export class UI {
  public static getPanelItem(namespace: Parameters<typeof getPanelItem>[0], name: string): string {
    return getPanelItem(namespace, name);
  }
}
