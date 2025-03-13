import { Extension as TiptapExtension } from "@tiptap/core";

// core
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Image } from "@tiptap/extension-image";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Italic } from "@tiptap/extension-italic";
import { Underline } from "@tiptap/extension-underline";
import { Blockquote } from "@tiptap/extension-blockquote";
import { BulletList } from "@tiptap/extension-bullet-list";
import { Heading } from "@tiptap/extension-heading";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Strike } from "@tiptap/extension-strike";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

// experiments
import Iframe from "./extension/experiments/iframe";

// table
import { Table } from "./extension/table";
import { TableCell } from "./extension/table-cell";
import { TableHeader } from "./extension/table-header";
import { TableRow } from "@tiptap/extension-table-row";

// custom
import { Indent } from "./extension/indent";
import { Div } from "./extension/div";
import { Span } from "./extension/span";
import { Bold } from "./extension/bold";
import { BlockLink } from "./extension/block-link";
import { InlineLink } from "./extension/inline-link";
import { Paragraph } from "./extension/paragraph";
import { TextBlock } from "./extension/text-block";
import { Pre } from "./extension/pre";
import { Code } from "./extension/code";
import { DescriptionList } from "./extension/description-list";
import { DescriptionTerm } from "./extension/description-term";
import { DescriptionDetails } from "./extension/description-details";
import { Summary } from "./extension/summary";
import { ListItem } from "./extension/list-item";
import { BackgroundColor } from "./extension/background-color";
import { Script } from "./extension/script";
import { EmbedObject } from "./extension/embed-object";
import { Markdown } from "./extension/markdown";
import { History } from "./extension/history";
import { MovableType } from "./extension/movable-type";

const defaultLinkOptions = {
  openOnClick: false,
};

export const Extension = TiptapExtension.create({
  name: "mt-rich-text-editor",

  addExtensions() {
    const extensions = [];

    if (this.options.movableType !== false) {
      extensions.push(MovableType.configure(this.options?.movableType));
    }

    if (this.options.history !== false) {
      extensions.push(History.configure(this.options?.history));
    }

    // core
    if (this.options.document !== false) {
      extensions.push(Document.configure(this.options?.document));
    }

    if (this.options.text !== false) {
      extensions.push(Text.configure(this.options?.text));
    }

    if (this.options.image !== false) {
      extensions.push(
        Image.configure(
          this.options?.image ?? {
            inline: true,
            allowBase64: true,
          }
        )
      );
    }

    if (this.options.hardBreak !== false) {
      extensions.push(HardBreak.configure(this.options?.hardBreak));
    }

    if (this.options.bold !== false) {
      extensions.push(Bold.configure(this.options?.bold));
    }

    if (this.options.italic !== false) {
      extensions.push(Italic.configure(this.options?.italic));
    }

    if (this.options.underline !== false) {
      extensions.push(Underline.configure(this.options?.underline));
    }

    if (this.options.strike !== false) {
      extensions.push(Strike.configure(this.options?.strike));
    }

    if (this.options.blockquote !== false) {
      extensions.push(Blockquote.configure(this.options?.blockquote));
    }

    if (this.options.table !== false) {
      extensions.push(
        Table.configure(
          this.options?.table ?? {
            resizable: true,
          }
        )
      );
    }

    if (this.options.tableRow !== false) {
      extensions.push(TableRow.configure(this.options?.tableRow));
    }

    if (this.options.tableHeader !== false) {
      extensions.push(TableHeader.configure(this.options?.tableHeader));
    }

    if (this.options.tableCell !== false) {
      extensions.push(TableCell.configure(this.options?.tableCell));
    }

    if (this.options.bulletList !== false) {
      extensions.push(BulletList.configure(this.options?.bulletList));
    }

    if (this.options.heading !== false) {
      extensions.push(Heading.configure(this.options?.heading));
    }

    if (this.options.horizontalRule !== false) {
      extensions.push(HorizontalRule.configure(this.options?.horizontalRule));
    }

    if (this.options.orderedList !== false) {
      extensions.push(OrderedList.configure(this.options?.orderedList));
    }

    if (this.options.dropcursor !== false) {
      extensions.push(Dropcursor.configure(this.options?.dropcursor));
    }

    if (this.options.gapcursor !== false) {
      extensions.push(Gapcursor.configure(this.options?.gapcursor));
    }

    if (this.options.textAlign !== false) {
      extensions.push(
        TextAlign.configure(
          this.options?.textAlign ?? {
            types: ["heading", "paragraph"],
            defaultAlignment: "",
          }
        )
      );
    }

    if (this.options.color !== false) {
      extensions.push(Color.configure(this.options?.color));
    }

    if (this.options.textStyle !== false) {
      extensions.push(TextStyle.configure(this.options?.textStyle));
    }

    // experiments
    if (this.options.iframe !== false) {
      extensions.push(Iframe.configure(this.options?.iframe));
    }

    // custom
    if (this.options.indent !== false) {
      extensions.push(Indent.configure(this.options?.indent));
    }

    if (this.options.paragraph !== false) {
      extensions.push(Paragraph.configure(this.options?.paragraph));
    }

    if (this.options.textBlock !== false) {
      extensions.push(TextBlock.configure(this.options?.textBlock));
    }

    if (this.options.pre !== false) {
      extensions.push(Pre.configure(this.options?.pre));
    }

    if (this.options.code !== false) {
      extensions.push(Code.configure(this.options?.code));
    }

    if (this.options.descriptionList !== false) {
      extensions.push(DescriptionList.configure(this.options?.descriptionList));
    }

    if (this.options.descriptionTerm !== false) {
      extensions.push(DescriptionTerm.configure(this.options?.descriptionTerm));
    }

    if (this.options.descriptionDetails !== false) {
      extensions.push(DescriptionDetails.configure(this.options?.descriptionDetails));
    }

    if (this.options.summary !== false) {
      extensions.push(Summary.configure(this.options?.summary));
    }

    if (this.options.listItem !== false) {
      extensions.push(ListItem.configure(this.options?.listItem));
    }

    if (this.options.div !== false) {
      extensions.push(Div.configure(this.options?.div));
    }

    if (this.options.span !== false) {
      extensions.push(Span.configure(this.options?.span));
    }

    if (this.options.inlineLink !== false) {
      extensions.push(InlineLink.configure(this.options?.inlineLink ?? defaultLinkOptions));
    }

    if (this.options.blockLink !== false) {
      extensions.push(BlockLink.configure(this.options?.blockLink ?? defaultLinkOptions));
    }

    if (this.options.backgroundColor !== false) {
      extensions.push(BackgroundColor.configure(this.options?.backgroundColor));
    }

    if (this.options.script !== false) {
      extensions.push(Script.configure(this.options?.script));
    }

    if (this.options.embedObject !== false) {
      extensions.push(EmbedObject.configure(this.options?.embedObject));
    }

    if (this.options.markdown !== false) {
      extensions.push(Markdown.configure(this.options?.markdown));
    }

    return extensions;
  },
});
