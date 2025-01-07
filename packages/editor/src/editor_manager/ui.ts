import { getPanelItem } from "../ui/item/registry";

export class UI {
  public static getPanelItem(
    namespace: Parameters<typeof getPanelItem>[0],
    name: string
  ): string | undefined {
    return getPanelItem(namespace, name);
  }
}
