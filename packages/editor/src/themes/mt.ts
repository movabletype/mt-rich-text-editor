import Quill from "quill";
import type { ThemeOptions } from "quill/core/theme";
import type Toolbar from "quill/modules/toolbar";
import SnowTheme from "quill/themes/snow";
import icons from "quill/ui/icons";
import hrIcon from "./icons/hr.svg?raw";
import redoIcon from "./icons/redo.svg?raw";
import undoIcon from "./icons/undo.svg?raw";

Object.assign(icons, {
  hr: hrIcon,
  redo: redoIcon,
  undo: undoIcon,
});

class MovableTypeTheme extends SnowTheme {
  constructor(quill: Quill, options: ThemeOptions) {
    super(quill, options);
    this.quill.container.classList.add("ql-mt");
    this.quill.on("selection-change", this.handleSelectionChange.bind(this));
  }

  extendToolbar(toolbar: Toolbar) {
    super.extendToolbar(toolbar);

    if (!toolbar.container) {
      return;
    }

    toolbar.container.classList.add("ql-mt");
  }

  handleSelectionChange() {
    this.quill.root
      .querySelectorAll(".ql-selected")
      .forEach((node) => node.classList.remove("ql-selected"));

    const selection = this.quill.getSelection();
    if (selection) {
      const [blot] = this.quill.getLeaf(selection.index);
      if (blot?.domNode instanceof HTMLElement) {
        blot.domNode.classList.add("ql-selected");
      }
    }
  }
}

MovableTypeTheme.DEFAULTS = {
  ...SnowTheme.DEFAULTS,
  modules: {
    ...SnowTheme.DEFAULTS.modules,
    toolbar: {
      ...SnowTheme.DEFAULTS.modules.toolbar,
      handlers: {
        ...SnowTheme.DEFAULTS.modules.toolbar?.handlers,
        hr() {
          this.quill.insertEmbed(
            this.quill.getSelection()?.index ?? 0,
            "hr",
            true,
            Quill.sources.USER
          );
          const range = this.quill.getSelection();
          if (range) {
            this.quill.setSelection(range.index + 1, 0);
          }
        },
        undo() {
          this.quill.history.undo();
        },
        redo() {
          this.quill.history.redo();
        },
      },
    },
  },
};

Quill.register("themes/mt", MovableTypeTheme);

export default MovableTypeTheme;
