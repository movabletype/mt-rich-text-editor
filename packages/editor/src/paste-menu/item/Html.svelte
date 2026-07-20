<svelte:options
  customElement={{
    extend,
  }}
/>

<script module lang="ts">
  import { extendPasteMenuItem } from "./svelte";

  const HTML_LIKE_CLOSING_OR_SELF_CLOSING_RE =
    /<\/[a-z][a-z0-9]*\s*>|<[a-z][a-z0-9]*(?=[\s/>])[^>]*\/>/i;
  const HTML_LIKE_TAG_RE = /^<([a-z][a-z0-9]*)(?=[\s/>])([\s\S]*?)>$/i;

  const VOID_TAGS = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  const isHtmlLikePlainText = (content: string): boolean => {
    const trimmedContent = content.trim();
    if (!trimmedContent.startsWith("<") || !trimmedContent.endsWith(">")) {
      return false;
    }

    if (HTML_LIKE_CLOSING_OR_SELF_CLOSING_RE.test(trimmedContent)) {
      return true;
    }

    const tagMatch = trimmedContent.match(HTML_LIKE_TAG_RE);
    if (!tagMatch) {
      return false;
    }

    const [, tagName, trailingContent] = tagMatch;
    if (VOID_TAGS.has(tagName.toLowerCase())) {
      return true;
    }

    return /\s+[^\s"'/>=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/.test(trailingContent);
  };

  // eslint-disable-next-line no-useless-assignment -- extend is read by the <svelte:options customElement={{ extend }}> tag above, which this rule's control-flow analysis does not see
  const extend = (customElementConstructor: typeof HTMLElement) =>
    class extends extendPasteMenuItem(customElementConstructor) {
      isEditorItemAvailable() {
        const doc = this.content?.htmlDocument;
        if (!doc) {
          return isHtmlLikePlainText(this.content?.plainText || "");
        }
        const childNodes = doc.body.childNodes;
        if (childNodes.length === 0) {
          return false;
        }

        if (
          childNodes.length === 1 &&
          childNodes[0] instanceof HTMLParagraphElement &&
          childNodes[0].getAttribute("data-pm-slice") &&
          [...childNodes[0].childNodes].every((n) => n instanceof Text)
        ) {
          return false;
        }

        return true;
      }
    };
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { mount, unmount } from "svelte";
  import HtmlModal from "./HtmlModal.svelte";
  import type { PasteMenuItemElement } from "./element";
  import { INTERNAL_PASTE_CONTENT_TYPE } from ".";
  import { PRESERVED_DATA_ATTRIBUTE_KEYS } from "./data-attribute";

  const element = $host<PasteMenuItemElement>();
  element.addEventListener("click", toggleDetailPanel);

  const { options, tiptap, editor } = element;

  let modalComponent: ReturnType<typeof mount> | null = null;

  const apply = (htmlDocument: Document | null | undefined = null) => {
    if (!tiptap || !editor) {
      return;
    }

    if (!htmlDocument) {
      htmlDocument = element.content?.htmlDocument?.cloneNode(true) as Document | undefined;
      if (htmlDocument && !options.keepDataAttributes) {
        htmlDocument.body.querySelectorAll<HTMLElement>("*").forEach((e) => {
          for (const key in e.dataset) {
            if (!PRESERVED_DATA_ATTRIBUTE_KEYS.has(key)) {
              delete e.dataset[key];
            }
          }
        });
      }
      if (!htmlDocument) {
        const plainTextContent = element.content?.plainText || "";
        const fragment = document.createRange().createContextualFragment(plainTextContent);
        // HTML-like plain text snippets (for example embed codes) are treated as trusted input
        // and bypass the attribute filtering modal/data-* stripping used for clipboard text/html.

        // tiptap will not paste without text content, so add a zero-width space to perform the process
        if (fragment.textContent.trim() === "") {
          const sentinel = document.createElement("span");
          sentinel.textContent = "\u200B"; // zero-width space
          sentinel.setAttribute("data-paste-html-sentinel", "1");
          fragment.appendChild(sentinel);
        }

        htmlDocument = document.implementation.createHTMLDocument();
        htmlDocument.body.appendChild(fragment);
      }
    }
    if (htmlDocument) {
      (options.handler as ((doc: Document) => void) | undefined)?.(htmlDocument);
    }
    const html = editor.preprocessHTML(htmlDocument?.body.innerHTML ?? "");

    const event = new ClipboardEvent("paste", {
      clipboardData: new DataTransfer(),
    });

    event.clipboardData?.setData("text/html", html);
    event.clipboardData?.setData(INTERNAL_PASTE_CONTENT_TYPE, "1");

    element.content?.transaction(() => {
      tiptap.chain().undo().focus().run();
      tiptap.view.dom.dispatchEvent(event);

      // remove the sentinel element after pasting if it exists
      const sentinel = tiptap.view.dom.querySelector('[data-paste-html-sentinel="1"]');
      if (sentinel) {
        const { tr } = tiptap.state;
        const pos = tr.doc.resolve(tiptap.view.posAtDOM(sentinel, 0)).pos;
        tr.delete(pos, pos + 1);
        tiptap.view.dispatch(tr);
      }
    });
    element.parentElement?.dispatchEvent(new Event("paste-menu-item-applied"));

    unmountModal();
  };
  element.onEditorPaste = apply;

  function toggleDetailPanel(ev: MouseEvent) {
    if (!tiptap) {
      return;
    }
    ev.stopPropagation();

    const htmlDocument = element.content?.htmlDocument;
    if (!htmlDocument) {
      apply();
      return;
    }

    if (!modalComponent) {
      modalComponent = mount(HtmlModal, {
        target: document.body,
        props: {
          keepDataAttributes: !!options.keepDataAttributes,
          htmlDocument,
          onSubmit: apply,
          onClose: () => {
            unmountModal();
          },
        },
      });
    } else {
      unmountModal();
    }
  }

  function unmountModal() {
    if (modalComponent) {
      unmount(modalComponent);
      modalComponent = null;
    }
  }

  $effect(() => unmountModal);
</script>

<button>{`${t("Paste as HTML")}...`}</button>
