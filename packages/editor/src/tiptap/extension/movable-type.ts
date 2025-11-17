import { Extension } from "@tiptap/core";

import { Global } from "./movable-type/global";
import { MTTag } from "./movable-type/mt-tag";
import type { Editor, Events } from "../../editor";

export interface MovableTypeOptions {
  editor: Editor;
  additionalGlobalAttributeTypes?: string[];
  tags: string[];
}

declare module "@tiptap/core" {
  interface Commands {
    movableType: {
      emitEditorEvent: <K extends keyof Events>(name: K, data: Events[K]) => void;
    };
  }
}

export const MovableType = Extension.create<MovableTypeOptions>({
  name: "mt-rich-text-editor-group",

  addExtensions() {
    return [
      Global.configure({
        additionalGlobalAttributeTypes: this.options.additionalGlobalAttributeTypes || [],
      }),
      MTTag.configure({
        tags: this.options.tags,
      }),
    ];
  },

  addCommands() {
    return {
      emitEditorEvent:
        <K extends keyof Events>(name: K, data: Events[K]) =>
        () => {
          this.options.editor.emit(name, data);
        },
    };
  },
});
