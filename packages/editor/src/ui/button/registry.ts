import { Editor } from "@tiptap/core";
import { undoDepth, redoDepth } from "@tiptap/pm/history";
import { normalizeHTML, preprocessHTML } from "../../util";
import { mount, unmount } from "svelte";

import insertHtmlIcon from "../icon/insertHtml.svg?raw";
import InsertHtmlModal from "../insertHtml/Modal.svelte";

import sourceIcon from "../icon/source.svg?raw";
import SourceModal from "../source/Modal.svelte";

import tableIcon from "../icon/table.svg?raw";
import TableToolbarMenu from "../table/ToolbarMenu.svelte";

import linkIcon from "../icon/link.svg?raw";
import LinkModal from "../link/Modal.svelte";
import type { LinkData } from "../link/Modal.svelte";

import boldIcon from "../icon/bold.svg?raw";
import italicIcon from "../icon/italic.svg?raw";
import underlineIcon from "../icon/underline.svg?raw";
import strikeIcon from "../icon/strike.svg?raw";
import bulletListIcon from "../icon/bulletList.svg?raw";
import orderedListIcon from "../icon/orderedList.svg?raw";
import horizontalRuleIcon from "../icon/horizontalRule.svg?raw";
import blockquoteIcon from "../icon/blockquote.svg?raw";
import unlinkIcon from "../icon/unlink.svg?raw";
import undoIcon from "../icon/undo.svg?raw";
import redoIcon from "../icon/redo.svg?raw";
import foregroundColorIcon from "../icon/foregroundColor.svg?raw";
import backgroundColorIcon from "../icon/backgroundColor.svg?raw";
import removeFormatIcon from "../icon/removeFormat.svg?raw";
import alignLeftIcon from "../icon/alignLeft.svg?raw";
import alignCenterIcon from "../icon/alignCenter.svg?raw";
import alignRightIcon from "../icon/alignRight.svg?raw";
import indentIcon from "../icon/indent.svg?raw";
import outdentIcon from "../icon/outdent.svg?raw";

import "../block/Select.svelte";

export class EditorButtonInitEvent extends CustomEvent<{ editor: Editor }> {
  constructor(editor: Editor) {
    super("editor-button-init", { detail: { editor } });
  }
}

export class EditorButtonClickEvent extends CustomEvent<{ editor: Editor }> {
  constructor(editor: Editor) {
    super("editor-button-click", { detail: { editor } });
  }
}

export class EditorButtonUpdateEvent extends CustomEvent<{ editor: Editor }> {
  constructor(editor: Editor) {
    super("editor-button-update", { detail: { editor } });
  }
}

function createButtonClass(
  name: string,
  icon: string,
  method?: string,
  stateClass?: string | false,
  checkState?: (editor: Editor) => boolean
) {
  method ??= `toggle${name.slice(0, 1).toUpperCase() + name.slice(1)}`;
  stateClass ??= `is-active`;
  checkState ??= (editor: Editor) => editor.isActive(name);

  return class extends HTMLElement {
    constructor() {
      super();
      const svg = document.createElement("svg");
      svg.innerHTML = icon;
      this.attachShadow({ mode: "open" }).appendChild(svg);
    }

    connectedCallback() {
      this.addEventListener("editor-button-click", (ev: Event) => {
        const customEvent = ev as EditorButtonClickEvent;
        (customEvent.detail.editor.chain().focus() as any)[method]().run();
      });

      if (stateClass !== false) {
        this.addEventListener("editor-button-update", (ev: Event) => {
          const customEvent = ev as EditorButtonUpdateEvent;
          this.classList.toggle(stateClass, checkState(customEvent.detail.editor));
        });
      }
    }
  };
}

function createTextAlignButtonClass(name: string, icon: string) {
  const targetAlign = name.substring(5).toLowerCase();

  return class extends HTMLElement {
    constructor() {
      super();
      const svg = document.createElement("svg");
      svg.innerHTML = icon;
      this.attachShadow({ mode: "open" }).appendChild(svg);
    }

    connectedCallback() {
      this.addEventListener("editor-button-click", (ev: Event) => {
        const editor = (ev as EditorButtonClickEvent).detail.editor;
        const nodeType = editor.state.selection.$head.parent.type.name;
        const currentAlign = editor.getAttributes(nodeType).textAlign;

        if (currentAlign === targetAlign) {
          editor.chain().focus().unsetTextAlign().run();
        } else {
          editor.chain().focus().setTextAlign(targetAlign).run();
        }
      });

      this.addEventListener("editor-button-update", (ev: Event) => {
        const editor = (ev as EditorButtonUpdateEvent).detail.editor;
        const nodeType = editor.state.selection.$head.parent.type.name;
        const currentAlign = editor.getAttributes(nodeType).textAlign;
        this.classList.toggle("is-active", currentAlign === targetAlign);
      });
    }
  };
}

export const BoldButton = createButtonClass("bold", boldIcon);
export const ItalicButton = createButtonClass("italic", italicIcon);
export const UnderlineButton = createButtonClass("underline", underlineIcon);
export const StrikeButton = createButtonClass("strike", strikeIcon);
export const UnlinkButton = createButtonClass(
  "unlink",
  unlinkIcon,
  "unsetLink",
  "is-disabled",
  (editor: Editor) => !editor.isActive("link")
);
export const BulletListButton = createButtonClass("bulletList", bulletListIcon);
export const OrderedListButton = createButtonClass("orderedList", orderedListIcon);
export const BlockquoteButton = createButtonClass("blockquote", blockquoteIcon);
export const UndoButton = createButtonClass(
  "undo",
  undoIcon,
  "undo",
  "is-disabled",
  (editor: Editor) => undoDepth(editor.state) === 0
);
export const RedoButton = createButtonClass(
  "redo",
  redoIcon,
  "redo",
  "is-disabled",
  (editor: Editor) => redoDepth(editor.state) === 0
);
export const ForegroundColorButton = createButtonClass("foregroundColor", foregroundColorIcon);
export const BackgroundColorButton = createButtonClass("backgroundColor", backgroundColorIcon);
export const RemoveFormatButton = createButtonClass(
  "removeFormat",
  removeFormatIcon,
  "unsetAllMarks",
  false
);
export const AlignLeftButton = createTextAlignButtonClass("alignLeft", alignLeftIcon);
export const AlignCenterButton = createTextAlignButtonClass("alignCenter", alignCenterIcon);
export const AlignRightButton = createTextAlignButtonClass("alignRight", alignRightIcon);
export const IndentButton = createButtonClass("indent", indentIcon, "indent", false);
export const OutdentButton = createButtonClass("outdent", outdentIcon, "outdent", false);

export class HorizontalRuleButton extends HTMLElement {
  constructor() {
    super();
    const svg = document.createElement("svg");
    svg.innerHTML = horizontalRuleIcon;
    this.attachShadow({ mode: "open" }).appendChild(svg);
  }

  connectedCallback() {
    this.addEventListener("editor-button-click", (ev: Event) => {
      const customEvent = ev as EditorButtonClickEvent;
      customEvent.detail.editor.chain().focus().setHorizontalRule().run();
    });
  }
}

export class LinkButton extends HTMLElement {
  constructor() {
    super();
    const svg = document.createElement("svg");
    svg.innerHTML = linkIcon;
    this.attachShadow({ mode: "open" }).appendChild(svg);
  }

  connectedCallback() {
    this.addEventListener("editor-button-click", (ev: Event) => {
      const customEvent = ev as EditorButtonClickEvent;

      const { editor } = customEvent.detail;
      let linkData: LinkData;
      if (editor.isActive("link")) {
        editor.chain().extendMarkRange("link").run();

        const linkText = editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to
        );

        const attrs = editor.getAttributes("link");
        linkData = {
          url: attrs.href || "",
          text: linkText,
          title: attrs.title || "",
          target: attrs.target || "_self",
        };
      } else {
        linkData = {
          url: "",
          text: editor.state.selection.empty
            ? ""
            : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to),
          title: "",
          target: "_self",
        };
      }

      const modal = mount(LinkModal, {
        target: document.body,
        props: {
          linkData,
          onSubmit: (linkData: LinkData) => {
            const chain = editor.chain().focus();

            if (editor.isActive("link")) {
              chain.extendMarkRange("link");
            }

            chain
              .deleteSelection()
              .insertContent({
                type: "text",
                text: linkData.text,
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: linkData.url,
                      target: linkData.target,
                      title: linkData.title,
                    },
                  },
                ],
              })
              .run();
            unmount(modal);
          },
          onClose: () => {
            unmount(modal);
          },
        },
      });
    });

    this.addEventListener("editor-button-update", (ev: Event) => {
      const customEvent = ev as EditorButtonUpdateEvent;
      this.classList.toggle("is-active", customEvent.detail.editor.isActive("link"));
    });
  }
}

export class InsertHtmlButton extends HTMLElement {
  constructor() {
    super();
    const svg = document.createElement("svg");
    svg.innerHTML = insertHtmlIcon;
    this.attachShadow({ mode: "open" }).appendChild(svg);
  }

  connectedCallback() {
    this.addEventListener("editor-button-click", (ev: Event) => {
      const editor = (ev as EditorButtonClickEvent).detail.editor;
      const modal = mount(InsertHtmlModal, {
        target: document.body,
        props: {
          text: normalizeHTML(editor.getHTML()),
          onSubmit: (html: string) => {
            editor.commands.insertContent(preprocessHTML(html));
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

export class TableButton extends HTMLElement {
  private menuContainer: HTMLElement | null = null;
  constructor() {
    super();
    const svg = document.createElement("svg");
    svg.innerHTML = tableIcon;
    this.attachShadow({ mode: "open" }).appendChild(svg);
  }

  connectedCallback() {
    this.menuContainer = document.createElement("div");
    this.menuContainer.classList.add("mt-rich-text-editor-table-menu-container");
    this.parentElement?.appendChild(this.menuContainer);

    this.addEventListener("editor-button-click", (ev: Event) => {
      const editor = (ev as EditorButtonClickEvent).detail.editor;
      const modal = mount(TableToolbarMenu, {
        target: this.menuContainer as HTMLElement,
        props: {
          onSubmit: (html: string) => {
            editor.commands.insertContent(preprocessHTML(html));
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

export class SourceButton extends HTMLElement {
  constructor() {
    super();
    const svg = document.createElement("svg");
    svg.innerHTML = sourceIcon;
    this.attachShadow({ mode: "open" }).appendChild(svg);
  }

  connectedCallback() {
    this.addEventListener("editor-button-click", (ev: Event) => {
      const editor = (ev as EditorButtonClickEvent).detail.editor;
      const modal = mount(SourceModal, {
        target: document.body,
        props: {
          text: normalizeHTML(editor.getHTML()),
          onSubmit: (html: string) => {
            editor.commands.setContent(preprocessHTML(html));
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

const systemButtons: Record<string, typeof HTMLElement> = {
  bold: BoldButton,
  italic: ItalicButton,
  underline: UnderlineButton,
  strike: StrikeButton,
  bulletList: BulletListButton,
  orderedList: OrderedListButton,
  horizontalRule: HorizontalRuleButton,
  blockquote: BlockquoteButton,
  link: LinkButton,
  unlink: UnlinkButton,
  insertHtml: InsertHtmlButton,
  table: TableButton,
  source: SourceButton,
  undo: UndoButton,
  redo: RedoButton,
  foregroundColor: ForegroundColorButton,
  backgroundColor: BackgroundColorButton,
  removeFormat: RemoveFormatButton,
  alignLeft: AlignLeftButton,
  alignCenter: AlignCenterButton,
  alignRight: AlignRightButton,
  indent: IndentButton,
  outdent: OutdentButton,
};

export const prefix = "mt-rich-text-editor-toolbar-item-";
export const getDefinedButton = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("-") && window.customElements.get(lowerName)) {
    // specified by full name
    return lowerName;
  }

  const elementName = `${prefix}${lowerName}`;
  let elementConstructor = window.customElements.get(elementName);
  if (!elementConstructor) {
    elementConstructor = systemButtons[name];
    if (!elementConstructor) {
      throw new Error(`Button for ${name} is not found`);
    }
    window.customElements.define(elementName, elementConstructor);
  }
  return elementName;
};
