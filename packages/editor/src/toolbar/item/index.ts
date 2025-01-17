import {
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikeButton,
  BulletListButton,
  OrderedListButton,
  HorizontalRuleButton,
  BlockquoteButton,
  UnlinkButton,
  InsertHtmlButton,
  SourceButton,
  UndoButton,
  RedoButton,
  RemoveFormatButton,
  AlignLeftButton,
  AlignCenterButton,
  AlignRightButton,
  IndentButton,
  OutdentButton,
  FullScreenButton,
} from "./simple-buttons";
import Link from "./link/Button.svelte";
import File from "./file/Button.svelte";
import Image from "./image/Button.svelte";
import Structure from "./structure/Button.svelte";

import Table from "./table/Button.svelte";
import Block from "./block/Select.svelte";
import ForegroundColor from "./color/ForegroundColor.svelte";
import BackgroundColor from "./color/BackgroundColor.svelte";
import Boilerplate from "./boilerplate/Button.svelte";

export default {
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
  link: Link.element!,
  file: File.element!,
  image: Image.element!,
  structure: Structure.element!,
  table: Table.element!,
  block: Block.element!,
  foregroundcolor: ForegroundColor.element!,
  backgroundcolor: BackgroundColor.element!,
  boilerplate: Boilerplate.element!,
};
