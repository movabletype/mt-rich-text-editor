import { extend } from "../../ui/item/svelte";
import { StatusbarItemElement } from "./element";

export const extendStatusbarItem = (
  customElementConstructor: typeof HTMLElement
): new () => StatusbarItemElement =>
  class extends extend(customElementConstructor) implements StatusbarItemElement {};
