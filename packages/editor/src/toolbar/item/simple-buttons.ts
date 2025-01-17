import { mount, unmount } from "svelte";
import { undoDepth, redoDepth } from "@tiptap/pm/history";
import { Editor as TiptapEditor } from "@tiptap/core";
import { t } from "../../i18n";
import { toKeyboardShortcutLabel } from "../../util/keyboardShortcut";
import { normalizeHTML, preprocessHTML } from "../../util/html";

import type { Editor } from "../../editor";
import { ToolbarItemElement } from "./element";

import { EditorEl } from "../../editor";

import insertHtmlIcon from "../../ui/icon/insertHtml.svg?raw";
import InsertHtmlModal from "./insertHtml/Modal.svelte";

import sourceIcon from "../../ui/icon/source.svg?raw";
import SourceModal from "./source/Modal.svelte";

import boldIcon from "../../ui/icon/bold.svg?raw";
import italicIcon from "../../ui/icon/italic.svg?raw";
import underlineIcon from "../../ui/icon/underline.svg?raw";
import strikeIcon from "../../ui/icon/strike.svg?raw";
import bulletListIcon from "../../ui/icon/bulletList.svg?raw";
import orderedListIcon from "../../ui/icon/orderedList.svg?raw";
import horizontalRuleIcon from "../../ui/icon/horizontalRule.svg?raw";
import blockquoteIcon from "../../ui/icon/blockquote.svg?raw";
import unlinkIcon from "../../ui/icon/unlink.svg?raw";
import undoIcon from "../../ui/icon/undo.svg?raw";
import redoIcon from "../../ui/icon/redo.svg?raw";
import removeFormatIcon from "../../ui/icon/removeFormat.svg?raw";
import alignLeftIcon from "../../ui/icon/alignLeft.svg?raw";
import alignCenterIcon from "../../ui/icon/alignCenter.svg?raw";
import alignRightIcon from "../../ui/icon/alignRight.svg?raw";
import indentIcon from "../../ui/icon/indent.svg?raw";
import outdentIcon from "../../ui/icon/outdent.svg?raw";
import fullScreenIcon from "../../ui/icon/fullScreen.svg?raw";

const createButtonClass = (
  label: string | [string, string],
  name: string,
  icon: string,
  method?: string | ((editor: TiptapEditor) => void),
  stateClass?: string | false,
  checkState?: (editor: Editor) => boolean
) => {
  method ??= `toggle${name.slice(0, 1).toUpperCase() + name.slice(1)}`;
  stateClass ??= `is-active`;
  checkState ??= (editor: Editor) => editor.tiptap.isActive(name);

  return class extends ToolbarItemElement {
    #button: HTMLButtonElement;
    constructor() {
      super();
      this.#button = document.createElement("button");
      this.#button.title =
        typeof label === "string"
          ? t(label)
          : `${t(label[0])} (${toKeyboardShortcutLabel(label[1])})`;
      this.#button.innerHTML = icon;
      this.shadowRoot.appendChild(this.#button);
    }

    connectedCallback() {
      super.connectedCallback();

      this.addEventListener("click", () => {
        const tiptap = this.tiptap;
        if (!tiptap) {
          return;
        }

        if (typeof method === "function") {
          method(tiptap);
        } else {
          (tiptap.chain().focus() as any)[method]().run();
        }
      });
    }

    onEditorUpdate() {
      if (stateClass !== false) {
        const state = checkState(this.editor!);
        this.#button.classList.toggle(stateClass, state);
        if (stateClass === "is-disabled") {
          this.#button.disabled = state;
        }
      }
    }
  };
};

const createTextAlignButtonClass = (
  label: string | [string, string],
  name: string,
  icon: string
) => {
  const targetAlign = name.substring(5).toLowerCase();

  return class extends ToolbarItemElement {
    #button: HTMLButtonElement;
    constructor() {
      super();
      this.#button = document.createElement("button");
      this.#button.title =
        typeof label === "string"
          ? t(label)
          : `${t(label[0])} (${toKeyboardShortcutLabel(label[1])})`;
      this.#button.innerHTML = icon;
      this.shadowRoot.appendChild(this.#button);
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("click", () => {
        const tiptap = this.tiptap;
        if (!tiptap) {
          return;
        }
        const nodeType = tiptap.state.selection.$head.parent.type.name;
        const currentAlign = tiptap.getAttributes(nodeType).textAlign;
        if (currentAlign === targetAlign) {
          tiptap.chain().focus().unsetTextAlign().run();
        } else {
          tiptap.chain().focus().setTextAlign(targetAlign).run();
        }
      });
    }

    onEditorUpdate() {
      const tiptap = this.tiptap;
      if (!tiptap) {
        return;
      }
      const nodeType = tiptap.state.selection.$head.parent.type.name;
      const currentAlign = tiptap.getAttributes(nodeType).textAlign;
      this.#button.classList.toggle("is-active", currentAlign === targetAlign);
    }
  };
};

export const BoldButton = createButtonClass(["Bold", "cmd+B"], "bold", boldIcon);
export const ItalicButton = createButtonClass(["Italic", "cmd+I"], "italic", italicIcon);
export const UnderlineButton = createButtonClass(
  ["Underline", "cmd+U"],
  "underline",
  underlineIcon
);
export const StrikeButton = createButtonClass("Strike", "strike", strikeIcon);
export const UnlinkButton = createButtonClass(
  "Unlink",
  "unlink",
  unlinkIcon,
  "unsetLink",
  "is-disabled",
  (editor: Editor) => !editor.tiptap.isActive("link")
);
export const BulletListButton = createButtonClass(
  "Bullet List",
  "bulletList",
  bulletListIcon,
  (tiptap) => {
    tiptap
      .chain()
      .focus()
      // FIXME: fix type error
      // @ts-ignore
      .lift(tiptap.state.selection.$from.before())
      .setNode(tiptap.isActive("bulletList") ? "paragraph" : "textBlock")
      .run();
    tiptap.chain().toggleBulletList().run();
  }
);
export const OrderedListButton = createButtonClass(
  "Ordered List",
  "orderedList",
  orderedListIcon,
  (tiptap) => {
    tiptap
      .chain()
      .focus()
      // FIXME: fix type error
      // @ts-ignore
      .lift(tiptap.state.selection.$from.before())
      .setNode(tiptap.isActive("orderedList") ? "paragraph" : "textBlock")
      .run();
    tiptap.chain().toggleOrderedList().run();
  }
);
export const BlockquoteButton = createButtonClass("Blockquote", "blockquote", blockquoteIcon);
export const UndoButton = createButtonClass(
  ["Undo", "cmd+Z"],
  "undo",
  undoIcon,
  "undo",
  "is-disabled",
  (editor: Editor) => undoDepth(editor.tiptap.state) === 0
);
export const RedoButton = createButtonClass(
  ["Redo", "cmd+Y"],
  "redo",
  redoIcon,
  "redo",
  "is-disabled",
  (editor: Editor) => redoDepth(editor.tiptap.state) === 0
);
export const RemoveFormatButton = createButtonClass(
  "Remove Format",
  "removeFormat",
  removeFormatIcon,
  (tiptap) => tiptap.chain().focus().unsetAllMarks().clearNodes().run(),
  false
);
export const AlignLeftButton = createTextAlignButtonClass("Align Left", "alignLeft", alignLeftIcon);
export const AlignCenterButton = createTextAlignButtonClass(
  "Align Center",
  "alignCenter",
  alignCenterIcon
);
export const AlignRightButton = createTextAlignButtonClass(
  "Align Right",
  "alignRight",
  alignRightIcon
);
export const IndentButton = createButtonClass("Indent", "indent", indentIcon, "indent", false);
export const OutdentButton = createButtonClass("Outdent", "outdent", outdentIcon, "outdent", false);

export class HorizontalRuleButton extends ToolbarItemElement {
  constructor() {
    super();
    const button = document.createElement("button");
    button.title = t("Horizontal Rule");
    button.innerHTML = horizontalRuleIcon;
    this.shadowRoot.appendChild(button);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", () => {
      const tiptap = this.tiptap;
      if (!tiptap) {
        return;
      }
      tiptap.chain().focus().setHorizontalRule().run();
    });
  }
}

export class InsertHtmlButton extends ToolbarItemElement {
  constructor() {
    super();
    const button = document.createElement("button");
    button.title = t("Insert HTML");
    button.innerHTML = insertHtmlIcon;
    this.shadowRoot.appendChild(button);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", () => {
      const tiptap = this.tiptap;
      if (!tiptap) {
        return;
      }
      const modal = mount(InsertHtmlModal, {
        target: document.body,
        props: {
          text: normalizeHTML(tiptap.getHTML()),
          onSubmit: (html: string) => {
            tiptap.commands.insertContent(preprocessHTML(html));
            unmount(modal);
          },
          onClose: () => {
            unmount(modal);
          },
        },
      });
    });
  }
}

export class SourceButton extends ToolbarItemElement {
  constructor() {
    super();
    const button = document.createElement("button");
    button.title = t("Toggle to HTML editing mode");
    button.innerHTML = sourceIcon;
    this.shadowRoot.appendChild(button);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", () => {
      const tiptap = this.tiptap;
      if (!tiptap) {
        return;
      }
      const modal = mount(SourceModal, {
        target: document.body,
        props: {
          text: normalizeHTML(tiptap.getHTML()),
          onSubmit: (html: string) => {
            tiptap.commands.setContent(preprocessHTML(html));
            unmount(modal);
          },
          onClose: () => {
            unmount(modal);
          },
        },
      });
    });
  }
}

export class FullScreenButton extends ToolbarItemElement {
  #button: HTMLButtonElement;
  #styleElement: HTMLStyleElement;
  constructor() {
    super();
    this.#styleElement = document.createElement("style");
    this.#styleElement.textContent = "body { overflow: hidden; }";
    this.#button = document.createElement("button");
    this.#button.title = t("Full Screen");
    this.#button.innerHTML = fullScreenIcon;
    this.shadowRoot.appendChild(this.#button);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", () => {
      const editor = this.editor;
      if (!editor) {
        return;
      }
      const isFullScreen = editor[EditorEl].classList.contains(
        "mt-rich-text-editor-editor--fullscreen"
      );

      editor[EditorEl].classList.toggle("mt-rich-text-editor-editor--fullscreen");
      this.#button.classList.toggle("is-active", !isFullScreen);

      if (!isFullScreen) {
        document.body.appendChild(this.#styleElement);
      } else {
        document.body.removeChild(this.#styleElement);
      }
    });
  }
}
