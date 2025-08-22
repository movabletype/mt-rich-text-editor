import { Extension } from "@tiptap/core";

import { Global } from "./movable-type/global";
import { MTTag } from "./movable-type/mt-tag";

export interface MovableTypeOptions {
  tags: string[];
}

export const MovableType = Extension.create<MovableTypeOptions>({
  name: "mt-rich-text-editor-group",

  addExtensions() {
    return [
      Global,
      MTTag.configure({
        tags: this.options.tags,
      }),
    ];
  },
});
