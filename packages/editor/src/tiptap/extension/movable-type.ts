import { Extension } from "@tiptap/core";

import { Global } from "./movable-type/global";
import { MTTag } from "./movable-type/mt-tag";

export const MovableType = Extension.create({
  name: "mt-rich-text-editor",

  addExtensions() {
    return [Global, MTTag];
  },
});
