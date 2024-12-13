import Quill from "quill";
import Emitter from "quill/core/emitter";
import type { ThemeOptions } from "quill/core/theme";
import type Toolbar from "quill/modules/toolbar";
import { BaseTooltip } from "quill/themes/base";
import SnowTheme from "quill/themes/snow";
import LinkBlot from "quill/formats/link";
import { icons } from "./icons";
import { mount, unmount } from "svelte";

import LinkModal from "./ui/link/Modal.svelte";
import SourceModal from "./ui/source/Modal.svelte";
import InsertHtmlModal from "./ui/insert_html/Modal.svelte";

class SnowTooltip extends BaseTooltip {
  static TEMPLATE = [
    '<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>',
    '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">',
    '<a class="ql-action"></a>',
    '<a class="ql-remove"></a>',
  ].join("");

  preview = this.root.querySelector("a.ql-preview");

  listen() {
    super.listen();
    // @ts-expect-error Fix me later
    this.root.querySelector("a.ql-action").addEventListener("click", (event) => {
      if (this.root.classList.contains("ql-editing")) {
        this.save();
      } else {
        // @ts-expect-error Fix me later
        this.edit("link", this.preview.textContent);
      }
      event.preventDefault();
    });
    // @ts-expect-error Fix me later
    this.root.querySelector("a.ql-remove").addEventListener("click", (event) => {
      if (this.linkRange != null) {
        const range = this.linkRange;
        this.restoreFocus();
        this.quill.formatText(range, "link", false, Emitter.sources.USER);
        delete this.linkRange;
      }
      event.preventDefault();
      this.hide();
    });
    this.quill.on(Emitter.events.SELECTION_CHANGE, (range, oldRange, source) => {
      if (range == null) return;
      if (range.length === 0 && source === Emitter.sources.USER) {
        const [link, offset] = this.quill.scroll.descendant(LinkBlot, range.index);
        if (link != null) {
          this.linkRange = new Range(range.index - offset, link.length());
          const preview = LinkBlot.formats(link.domNode);
          // @ts-expect-error Fix me later
          this.preview.textContent = preview;
          // @ts-expect-error Fix me later
          this.preview.setAttribute("href", preview);
          this.show();
          const bounds = this.quill.getBounds(this.linkRange);
          if (bounds != null) {
            this.position(bounds);
          }
          return;
        }
      } else {
        delete this.linkRange;
      }
      this.hide();
    });
  }

  show() {
    super.show();
    this.root.removeAttribute("data-mode");
  }
}

class MovableTypeTheme extends SnowTheme {
  #isInline: boolean = false;

  constructor(quill: Quill, options: ThemeOptions, isInline: boolean = false) {
    super(quill, options);
    this.quill.container.classList.add("ql-mt");
    this.quill.on("selection-change", this.handleSelectionChange.bind(this));
    this.#isInline = isInline;
  }

  extendToolbar(toolbar: Toolbar) {
    if (!toolbar.container) {
      return;
    }

    toolbar.container.querySelectorAll(".ql-formats").forEach((formatListEl) => {
      const buttons = formatListEl.querySelectorAll("button");
      if (buttons.length === 1) {
        formatListEl.classList.add(`ql-formats-${buttons[0].classList[0].replace("ql-", "")}`);
      }
    });

    toolbar.container.classList.add("ql-snow");
    toolbar.container.classList.add("ql-mt");

    if (this.#isInline) {
      toolbar.container.classList.add("ql-mt-inline");
      toolbar.container.addEventListener("click", (ev) => {
        (ev.currentTarget as HTMLElement).classList.remove("ql-mt-selected");
      });
      this.quill.root.addEventListener("blur", () => {
        (toolbar.container as HTMLElement).classList.remove("ql-mt-selected");
      });
    }

    this.buildButtons(toolbar.container.querySelectorAll("button"), icons);
    this.buildPickers(toolbar.container.querySelectorAll("select"), icons);
    // @ts-expect-error
    this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
    if (toolbar.container.querySelector(".ql-link")) {
      this.quill.keyboard.addBinding(
        { key: "k", shortKey: true },
        (_range: Range, context: Context) => {
          toolbar.handlers.link.call(toolbar, !context.format.link);
        }
      );
    }
  }

  handleSelectionChange() {
    this.quill.root
      .querySelectorAll(".ql-selected")
      .forEach((node) => node.classList.remove("ql-selected"));

    const selection = this.quill.getSelection();

    if (selection) {
      const toolbar = this.quill.container.previousElementSibling as HTMLElement;
      const [blot] = this.quill.getLeaf(selection.index);
      if (blot?.domNode instanceof HTMLElement) {
        blot.domNode.classList.add("ql-selected");
      }

      if (blot?.domNode) {
        const node =
          blot.domNode instanceof HTMLBRElement
            ? blot.domNode.parentElement
            : blot.domNode instanceof HTMLElement
              ? blot.domNode
              : blot.domNode.parentElement;
        if (node && this.#isInline) {
          if (selection.length > 0 || node.textContent === "") {
            toolbar?.classList.add("ql-mt-selected");
          } else {
            toolbar?.classList.remove("ql-mt-selected");
          }

          const rect = node.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          const absoluteTop = rect.top + scrollTop;
          const absoluteLeft = rect.left + scrollLeft;
          const height = rect.height;
          toolbar?.style.setProperty("top", `${absoluteTop + height + 10}px`);
          toolbar?.style.setProperty("left", `${absoluteLeft}px`);
        }
      }
    }
  }
}

class MovableTypeInlineTheme extends MovableTypeTheme {
  constructor(quill: Quill, options: ThemeOptions) {
    super(quill, options, true);
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
        mt_link() {
          const range = this.quill.getSelection(true);
          const linkModal = mount(LinkModal, {
            target: document.body,
            props: {
              linkData: {
                text: "",
                url: "",
                title: "",
                target: "_self",
              },
              onSubmit: (linkData) => {
                this.quill.deleteText(range.index, range.length);
                const a = document.createElement("a");
                a.href = linkData.url;
                a.title = linkData.title;
                a.target = linkData.target;
                a.textContent = linkData.text;
                this.quill.clipboard.dangerouslyPasteHTML(range.index, a.outerHTML);
              },
              onClose: () => {
                unmount(linkModal);
              },
            },
          });
        },
        source() {
          const text = this.quill.getSemanticHTML();
          const sourceModal = mount(SourceModal, {
            target: document.body,
            props: {
              text,
              onSubmit: (text) => {
                this.quill.clipboard.dangerouslyPasteHTML(text);
              },
              onClose: () => {
                unmount(sourceModal);
              },
            },
          });
        },
        insert_html() {
          const range = this.quill.getSelection(true);
          const insertHtmlModal = mount(InsertHtmlModal, {
            target: document.body,
            props: {
              text: "",
              onSubmit: (text) => {
                this.quill.deleteText(range.index, range.length);
                this.quill.clipboard.dangerouslyPasteHTML(range.index, text);
              },
              onClose: () => {
                unmount(insertHtmlModal);
              },
            },
          });
        },
      },
    },
  },
};

Quill.register("themes/mt", MovableTypeTheme);
Quill.register("themes/mt-inline", MovableTypeInlineTheme);

export default MovableTypeTheme;
