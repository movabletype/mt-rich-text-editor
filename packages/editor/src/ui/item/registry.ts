import type { Editor } from "../../editor";
import { EditorEl } from "../../editor";

import { undoDepth, redoDepth } from "@tiptap/pm/history";
import { normalizeHTML, preprocessHTML } from "../../util/html";
import { mount, unmount } from "svelte";

import insertHtmlIcon from "../icon/insertHtml.svg?raw";
import InsertHtmlModal from "../insertHtml/Modal.svelte";

import sourceIcon from "../icon/source.svg?raw";
import SourceModal from "../source/Modal.svelte";

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
import removeFormatIcon from "../icon/removeFormat.svg?raw";
import alignLeftIcon from "../icon/alignLeft.svg?raw";
import alignCenterIcon from "../icon/alignCenter.svg?raw";
import alignRightIcon from "../icon/alignRight.svg?raw";
import indentIcon from "../icon/indent.svg?raw";
import outdentIcon from "../icon/outdent.svg?raw";
import fullScreenIcon from "../icon/fullScreen.svg?raw";

import "./Link.svelte";
import "./File.svelte";
import "./Image.svelte";
import "./Structure.svelte";

import "../table/Button.svelte";
import "../block/Select.svelte";
import "../color/ForegroundColor.svelte";
import "../color/BackgroundColor.svelte";
import "../boilerplate/Button.svelte";

import "../paste/Html.svelte";
import "../paste/Link.svelte";
import "../paste/Embed.svelte";
import "../paste/EmbedInline.svelte";
import "../paste/Markdown.svelte";

export class PanelItemElement<
  Options extends Record<string, any> = Record<string, any>,
> extends HTMLElement {
  editor: Editor | undefined;
  options: Options = {} as Options;
  get tiptap(): Editor["tiptap"] | undefined {
    return this.editor?.tiptap;
  }

  onEditorInit(editor: Editor, options: Options) {
    this.editor = editor;
    this.options = options;
  }

  onEditorUpdate() {}
}

type PanelNamespace = "toolbar" | "statusbar" | "paste-menu" | "quick-action";

export const EditorEventType = {
  Init: "mt-rich-text-editor-panel-item-init",
  Click: "mt-rich-text-editor-panel-item-click",
  Update: "mt-rich-text-editor-panel-item-update",
} as const;

export class EditorEvent extends Event {
  public editor: Editor;
  public get tiptap() {
    return this.editor.tiptap;
  }
  constructor(type: (typeof EditorEventType)[keyof typeof EditorEventType], editor: Editor) {
    super(type);
    this.editor = editor;
  }
}

declare global {
  interface HTMLElement {
    addEventListener<K extends (typeof EditorEventType)[keyof typeof EditorEventType]>(
      type: K,
      listener: (this: HTMLElement, ev: EditorEvent) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends (typeof EditorEventType)[keyof typeof EditorEventType]>(
      type: K,
      listener: (this: HTMLElement, ev: EditorEvent) => any,
      options?: boolean | EventListenerOptions
    ): void;
  }
}

const createButtonClass = (
  name: string,
  icon: string,
  method?: string | ((editor: Editor["tiptap"]) => void),
  stateClass?: string | false,
  checkState?: (editor: Editor) => boolean
) => {
  method ??= `toggle${name.slice(0, 1).toUpperCase() + name.slice(1)}`;
  stateClass ??= `is-active`;
  checkState ??= (editor: Editor) => editor.tiptap.isActive(name);

  return class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML = icon;
    }

    connectedCallback() {
      this.addEventListener(EditorEventType.Click, ({ tiptap }) => {
        if (typeof method === "function") {
          method(tiptap);
        } else {
          (tiptap.chain().focus() as any)[method]().run();
        }
      });

      if (stateClass !== false) {
        this.addEventListener(EditorEventType.Update, ({ editor }) => {
          this.classList.toggle(stateClass, checkState(editor));
        });
      }
    }
  };
};

const createTextAlignButtonClass = (name: string, icon: string) => {
  const targetAlign = name.substring(5).toLowerCase();

  return class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML = icon;
    }

    connectedCallback() {
      this.addEventListener(EditorEventType.Click, ({ tiptap }) => {
        const nodeType = tiptap.state.selection.$head.parent.type.name;
        const currentAlign = tiptap.getAttributes(nodeType).textAlign;
        if (currentAlign === targetAlign) {
          tiptap.chain().focus().unsetTextAlign().run();
        } else {
          tiptap.chain().focus().setTextAlign(targetAlign).run();
        }
      });

      this.addEventListener(EditorEventType.Update, ({ tiptap }) => {
        const nodeType = tiptap.state.selection.$head.parent.type.name;
        const currentAlign = tiptap.getAttributes(nodeType).textAlign;
        this.classList.toggle("is-active", currentAlign === targetAlign);
      });
    }
  };
};

export const BoldButton = createButtonClass("bold", boldIcon);
export const ItalicButton = createButtonClass("italic", italicIcon);
export const UnderlineButton = createButtonClass("underline", underlineIcon);
export const StrikeButton = createButtonClass("strike", strikeIcon);
export const UnlinkButton = createButtonClass(
  "unlink",
  unlinkIcon,
  "unsetLink",
  "is-disabled",
  (editor: Editor) => !editor.tiptap.isActive("link")
);
export const BulletListButton = createButtonClass("bulletList", bulletListIcon, (tiptap) => {
  tiptap
    .chain()
    .focus()
    .lift(tiptap.state.selection.$from.before())
    .setNode(tiptap.isActive("bulletList") ? "paragraph" : "textBlock")
    .run();
  tiptap.chain().toggleBulletList().run();
});
export const OrderedListButton = createButtonClass("orderedList", orderedListIcon, (tiptap) => {
  tiptap
    .chain()
    .focus()
    .lift(tiptap.state.selection.$from.before())
    .setNode(tiptap.isActive("orderedList") ? "paragraph" : "textBlock")
    .run();
  tiptap.chain().toggleOrderedList().run();
});
export const BlockquoteButton = createButtonClass("blockquote", blockquoteIcon);
export const UndoButton = createButtonClass(
  "undo",
  undoIcon,
  "undo",
  "is-disabled",
  (editor: Editor) => undoDepth(editor.tiptap.state) === 0
);
export const RedoButton = createButtonClass(
  "redo",
  redoIcon,
  "redo",
  "is-disabled",
  (editor: Editor) => redoDepth(editor.tiptap.state) === 0
);
export const RemoveFormatButton = createButtonClass(
  "removeFormat",
  removeFormatIcon,
  (tiptap) => tiptap.chain().focus().unsetAllMarks().clearNodes().run(),
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
    this.attachShadow({ mode: "open" }).innerHTML = horizontalRuleIcon;
  }

  connectedCallback() {
    this.addEventListener(EditorEventType.Click, ({ tiptap }) => {
      tiptap.chain().focus().setHorizontalRule().run();
    });
  }
}

export class InsertHtmlButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = insertHtmlIcon;
  }

  connectedCallback() {
    this.addEventListener(EditorEventType.Click, ({ tiptap }) => {
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

export class SourceButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = sourceIcon;
  }

  connectedCallback() {
    this.addEventListener(EditorEventType.Click, ({ tiptap }) => {
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

export class FullScreenButton extends HTMLElement {
  private styleElement: HTMLStyleElement;
  constructor() {
    super();
    this.styleElement = document.createElement("style");
    this.styleElement.textContent = "body { overflow: hidden; }";
    this.attachShadow({ mode: "open" }).innerHTML = fullScreenIcon;
  }

  connectedCallback() {
    this.addEventListener(EditorEventType.Click, ({ editor }) => {
      const isFullScreen = editor[EditorEl].classList.contains(
        "mt-rich-text-editor-editor--fullscreen"
      );

      editor[EditorEl].classList.toggle("mt-rich-text-editor-editor--fullscreen");
      this.classList.toggle("is-active", !isFullScreen);

      if (!isFullScreen) {
        document.body.appendChild(this.styleElement);
      } else {
        document.body.removeChild(this.styleElement);
      }
    });
  }
}

export class PathItem<
  Options extends Record<string, any> = Record<string, any>,
> extends PanelItemElement<Options> {
  onEditorUpdate() {
    if (!this.tiptap) {
      return;
    }

    const { selection } = this.tiptap.state;
    const $head = selection.$head;

    const path: string[] = [];
    for (let depth = 1; depth <= $head.depth; depth++) {
      const node = $head.node(depth);
      let nodeName = this.getHTMLTag(node.type.name);
      if (!nodeName) {
        continue;
      }

      const textAlign = node.attrs.textAlign;
      if (textAlign) {
        nodeName += `[align=${textAlign}]`;
      }

      path.push(nodeName);
    }

    this.textContent = path.join(" > ");
  }

  private getHTMLTag(nodeName: string): string {
    const nodeToTagMap: Record<string, string> = {
      paragraph: "p",
      heading: "h1",
      bulletList: "ul",
      orderedList: "ol",
      listItem: "li",
      blockquote: "blockquote",
      horizontalRule: "hr",
      table: "table",
      tableRow: "tr",
      tableCell: "td",
      tableHeader: "th",
      hardBreak: "br",
      text: "",
      textBlock: "",
    };

    return nodeToTagMap[nodeName] ?? nodeName;
  }
}

export abstract class PasteMenuItemElement<
  Options extends Record<string, any> = Record<string, any>,
> extends PanelItemElement<Options> {
  protected content:
    | {
        plainText: string;
        htmlDocument: Document | null;
        clipboardData: DataTransfer;
        transaction: (cb: () => void | Promise<void>) => void;
      }
    | undefined = undefined;

  async isEditorItemAvailable(): Promise<boolean | number> {
    return Promise.resolve(true);
  }

  onEditorSetPasteContent(content: {
    plainText: string;
    htmlDocument: Document | null;
    targetDomNode: HTMLElement | null;
    clipboardData: DataTransfer;
    transaction: (cb: () => void | Promise<void>) => void;
  }) {
    this.content = content;
  }

  insertPasteContent(content: string) {
    this.content?.transaction(() => {
      this.tiptap?.chain().undo().focus().run();
      this.tiptap?.commands.insertContent(
        typeof content === "string" ? preprocessHTML(content) : content
      );
    });
  }

  onEditorPaste() {
    throw new Error("onEditorPaste is not implemented");
  }
}

export class AsText extends PasteMenuItemElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = "テキストとして貼り付け";
  }

  onEditorPaste() {
    const encoder = document.createElement("div");
    encoder.textContent = this.content?.plainText ?? "";
    this.insertPasteContent(encoder.innerHTML.replace(/\n/g, "<br>"));
    // TBD: enclose with <p> tag
    // this.insertPasteContent(preprocessHTML(`<p>${encoder.innerHTML}</p>`));
  }
}

const defineHeadingAction = (level: number) => {
  return class extends PanelItemElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML = `見出し${level}`;
    }

    connectedCallback() {
      this.addEventListener("click", () => {
        this.tiptap
          ?.chain()
          .focus()
          .selectParentNode()
          // .deleteSelection()
          .insertContent(`<h${level}></h${level}>`)
          .run();
      });
    }
  };
};
const ActionH1 = defineHeadingAction(1);
const ActionH2 = defineHeadingAction(2);
const ActionH3 = defineHeadingAction(3);
const ActionH4 = defineHeadingAction(4);
const ActionH5 = defineHeadingAction(5);
const ActionH6 = defineHeadingAction(6);

const systemItems: Record<PanelNamespace, Record<string, typeof HTMLElement>> = {
  toolbar: {
    bold: BoldButton,
    italic: ItalicButton,
    underline: UnderlineButton,
    strike: StrikeButton,
    bulletList: BulletListButton,
    orderedList: OrderedListButton,
    horizontalRule: HorizontalRuleButton,
    blockquote: BlockquoteButton,
    unlink: UnlinkButton,
    insertHtml: InsertHtmlButton,
    source: SourceButton,
    undo: UndoButton,
    redo: RedoButton,
    removeFormat: RemoveFormatButton,
    alignLeft: AlignLeftButton,
    alignCenter: AlignCenterButton,
    alignRight: AlignRightButton,
    indent: IndentButton,
    outdent: OutdentButton,
    fullScreen: FullScreenButton,
  },
  statusbar: {
    path: PathItem,
  },
  "paste-menu": {
    text: AsText,
  },
  "quick-action": {
    h1: ActionH1,
    h2: ActionH2,
    h3: ActionH3,
    h4: ActionH4,
    h5: ActionH5,
    h6: ActionH6,
  },
};

export const getPanelItem = (namespace: PanelNamespace, name: string): string | undefined => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("-") && window.customElements.get(lowerName)) {
    // specified by full name
    return lowerName;
  }

  const elementName = `mt-rich-text-editor-${namespace}-item-${lowerName}`;
  let elementConstructor = window.customElements.get(elementName);
  if (!elementConstructor) {
    elementConstructor = systemItems[namespace][name];
    if (!elementConstructor) {
      console.error(`Item for ${name} is not found`);
      return undefined;
    }
    window.customElements.define(elementName, elementConstructor);
  }
  return elementName;
};
