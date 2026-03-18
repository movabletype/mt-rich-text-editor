/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Fragment, type Mark, type Node as PMNode } from "@tiptap/pm/model";
import { t } from "../../i18n";
import Html from "./Html.svelte";
import Link from "./Link.svelte";
import Embed from "./Embed.svelte";
import EmbedInline from "./EmbedInline.svelte";
import Markdown from "./Markdown.svelte";

import { PasteMenuItemElement } from "./element";

export const INTERNAL_PASTE_CONTENT_TYPE = "x-mt-rich-text-editor";
const INLINE_DIRECT_BLOCKS = new Set(["heading", "summary"]);

const normalizeLineBreaks = (text: string): string => {
  return text.replace(/\r\n?/g, "\n");
};

const trimEdgeBlankLines = (text: string): string => {
  const lines = text.split("\n");
  let start = 0;
  let end = lines.length - 1;
  while (start <= end && lines[start].trim() === "") {
    start++;
  }
  while (end >= start && lines[end].trim() === "") {
    end--;
  }
  return lines.slice(start, end + 1).join("\n");
};

const fragmentToArray = (fragment: Fragment): PMNode[] => {
  const nodes: PMNode[] = [];
  fragment.forEach((node) => nodes.push(node));
  return nodes;
};

const getInsertionContext = (element: AsText) => {
  const { tiptap } = element;
  if (!tiptap) {
    return null;
  }

  const { selection } = tiptap.state;
  const tr = tiptap.state.tr;
  if (!tr.selection.empty) {
    tr.deleteSelection();
  }

  const activeMarks: readonly Mark[] = tr.storedMarks ?? tr.selection.$from.marks();
  const currentNodeName = tr.selection.$from.parent.type.name;
  const startBlock = selection.$from.parent;
  const endBlock = selection.$to.parent;
  const startDepth = selection.$from.depth;
  const endDepth = selection.$to.depth;

  if (
    currentNodeName !== "paragraph" &&
    currentNodeName !== "textBlock" &&
    !INLINE_DIRECT_BLOCKS.has(currentNodeName)
  ) {
    return null;
  }

  if (
    startDepth !== endDepth ||
    selection.$from.node(startDepth - 1) !== selection.$to.node(endDepth - 1)
  ) {
    return null;
  }

  if (startBlock.type.name !== currentNodeName) {
    return null;
  }

  if (!INLINE_DIRECT_BLOCKS.has(currentNodeName) && endBlock.type.name !== currentNodeName) {
    return null;
  }

  return {
    activeMarks,
    currentNodeName,
    attrs: startBlock.attrs,
    blockType: startBlock.type,
    prefix: startBlock.content.cut(0, selection.$from.parentOffset),
    suffix: endBlock.content.cut(selection.$to.parentOffset, endBlock.content.size),
    replaceFrom: selection.$from.before(startDepth),
    replaceTo: selection.$to.after(endDepth),
  };
};

type InsertionContext = NonNullable<ReturnType<typeof getInsertionContext>>;

const shouldInsertAsPlainText = ({
  content,
  isPre,
}: {
  content: string;
  isPre: boolean;
}): boolean => {
  const trimmed = content.trim();

  // Edge newlines alone should not trigger structured paste; only the trimmed
  // payload decides whether we preserve multiline structure outside <pre>.
  return trimmed === "" || !trimmed.includes("\n") || isPre;
};

type NewlineStrategy = (
  newlines: string,
  appendNode: (node: PMNode) => void,
  startNewBlock: () => void
) => void;

const tokenizeContent = (
  trimmedContent: string,
  tiptap: NonNullable<AsText["tiptap"]>,
  activeMarks: readonly Mark[],
  onNewlines: NewlineStrategy
): PMNode[][] => {
  const blocks: PMNode[][] = [[]];
  const appendNode = (node: PMNode) => blocks[blocks.length - 1].push(node);
  const startNewBlock = () => {
    blocks.push([]);
  };

  for (const token of trimmedContent.split(/(\n+)/)) {
    if (token === "") {
      continue;
    }

    if (token.startsWith("\n")) {
      onNewlines(token, appendNode, startNewBlock);
      continue;
    }

    appendNode(tiptap.state.schema.text(token, activeMarks));
  }

  return blocks;
};

const buildParagraphStructuredContent = (
  trimmedContent: string,
  tiptap: NonNullable<AsText["tiptap"]>,
  context: Pick<InsertionContext, "activeMarks" | "attrs" | "blockType" | "prefix" | "suffix">
) => {
  const { activeMarks } = context;
  const hardBreakType = tiptap.state.schema.nodes.hardBreak;
  const blocks = tokenizeContent(
    trimmedContent,
    tiptap,
    activeMarks,
    (token, appendNode, startNewBlock) => {
      if (token.length === 1) {
        appendNode(hardBreakType.create());
      } else {
        for (let i = 0; i < token.length - 1; i += 1) {
          startNewBlock();
        }
      }
    }
  );

  blocks[0] = [...fragmentToArray(context.prefix), ...blocks[0]];
  blocks[blocks.length - 1] = [...blocks[blocks.length - 1], ...fragmentToArray(context.suffix)];

  return Fragment.fromArray(
    blocks.map((block) => context.blockType.create(context.attrs, Fragment.fromArray(block)))
  );
};

const buildTextBlockStructuredContent = (
  trimmedContent: string,
  tiptap: NonNullable<AsText["tiptap"]>,
  context: InsertionContext
) => {
  const hardBreakType = tiptap.state.schema.nodes.hardBreak;
  const blocks = tokenizeContent(
    trimmedContent,
    tiptap,
    context.activeMarks,
    (token, appendNode) => {
      for (let i = 0; i < token.length; i += 1) {
        appendNode(hardBreakType.create());
      }
    }
  );

  const contentNodes = [
    ...fragmentToArray(context.prefix),
    ...blocks.flat(),
    ...fragmentToArray(context.suffix),
  ];

  return Fragment.from(context.blockType.create(context.attrs, Fragment.fromArray(contentNodes)));
};

const buildInlineDirectStructuredContent = (
  trimmedContent: string,
  tiptap: NonNullable<AsText["tiptap"]>,
  context: InsertionContext
) => {
  const { activeMarks } = context;
  const firstLineBreakIndex = trimmedContent.indexOf("\n");
  const firstLine =
    firstLineBreakIndex === -1 ? trimmedContent : trimmedContent.slice(0, firstLineBreakIndex);
  // Strip a single separator newline between the heading/summary line and the
  // paragraph remainder (e.g. "heading\n\nparagraph" → skip one \n after split).
  const remainder =
    firstLineBreakIndex === -1
      ? ""
      : trimmedContent.slice(firstLineBreakIndex + 1).replace(/^\n(?!\n)/, "");

  const nodes = [
    context.blockType.create(
      context.attrs,
      Fragment.fromArray([
        ...fragmentToArray(context.prefix),
        tiptap.state.schema.text(firstLine, activeMarks),
      ])
    ),
  ];

  if (remainder !== "") {
    const paragraphType = tiptap.state.schema.nodes.paragraph;
    const paragraphContent = buildParagraphStructuredContent(remainder, tiptap, {
      activeMarks,
      attrs: {},
      blockType: paragraphType,
      prefix: Fragment.empty,
      suffix: context.suffix,
    });

    if (paragraphContent) {
      nodes.push(...fragmentToArray(paragraphContent));
    }
  }

  return Fragment.fromArray(nodes);
};

const buildStructuredContent = (
  content: string,
  tiptap: NonNullable<AsText["tiptap"]>,
  context: InsertionContext
) => {
  const trimmedContent = trimEdgeBlankLines(content);

  if (context.currentNodeName === "textBlock") {
    return buildTextBlockStructuredContent(trimmedContent, tiptap, context);
  }
  if (INLINE_DIRECT_BLOCKS.has(context.currentNodeName)) {
    return buildInlineDirectStructuredContent(trimmedContent, tiptap, context);
  }

  return buildParagraphStructuredContent(trimmedContent, tiptap, context);
};

export class AsText extends PasteMenuItemElement {
  constructor() {
    super();
    const button = document.createElement("button");
    button.textContent = t("Paste as text");
    this.shadowRoot.appendChild(button);
  }

  onEditorPaste() {
    const content = this.content?.plainText;
    if (!content) {
      return;
    }

    this.content?.transaction(() => {
      const { tiptap, editor } = this;
      if (!tiptap || !editor) {
        return;
      }

      const normalizedContent = normalizeLineBreaks(content);
      const insertPlainText = () => {
        tiptap.commands.insertContent({
          type: "text",
          text: normalizedContent,
        });
      };

      tiptap.chain().undo().focus().run();

      const insertionContext = getInsertionContext(this);
      if (
        !insertionContext ||
        shouldInsertAsPlainText({
          content: normalizedContent,
          isPre: tiptap.isActive("pre"),
        })
      ) {
        insertPlainText();
        return;
      }

      const fragment = buildStructuredContent(normalizedContent, tiptap, insertionContext);

      editor.tiptap.view.dispatch(
        tiptap.state.tr.replaceWith(
          insertionContext.replaceFrom,
          insertionContext.replaceTo,
          fragment
        )
      );
    });

    this.parentElement?.dispatchEvent(new Event("paste-menu-item-applied"));
  }

  connectedCallback() {
    this.addEventListener("click", () => {
      this.onEditorPaste();
    });
  }
}

export default {
  text: AsText,
  // @ts-ignore
  html: Html.element!,
  // @ts-ignore
  link: Link.element!,
  // @ts-ignore
  embed: Embed.element!,
  // @ts-ignore
  embedInline: EmbedInline.element!,
  // @ts-ignore
  markdown: Markdown.element!,
};
