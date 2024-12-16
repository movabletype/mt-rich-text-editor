import icons from "quill/ui/icons";
import hrIcon from "./icons/hr.svg?raw";
import redoIcon from "./icons/redo.svg?raw";
import undoIcon from "./icons/undo.svg?raw";
import insertHtmlIcon from "./icons/insert_html.svg?raw";
import sourceIcon from "./icons/source.svg?raw";
import linkIcon from "./icons/link.svg?raw";
import unlinkIcon from "./icons/unlink.svg?raw";
import boilerplateIcon from "./icons/boilerplate.svg?raw";
import tableIcon from "./icons/table.svg?raw";

import boldIcon from "./icons/bold.svg?raw";
import italicIcon from "./icons/italic.svg?raw";
import underlineIcon from "./icons/underline.svg?raw";
import strikeIcon from "./icons/strike.svg?raw";
import blockquoteIcon from "./icons/blockquote.svg?raw";
import cleanIcon from "./icons/clean.svg?raw";
import alignleftIcon from "./icons/alignleft.svg?raw";
import aligncenterIcon from "./icons/aligncenter.svg?raw";
import alignrightIcon from "./icons/alignright.svg?raw";
import indentIcon from "./icons/indent.svg?raw";
import unindentIcon from "./icons/unindent.svg?raw";

Object.assign(icons, {
  hr: hrIcon,
  redo: redoIcon,
  undo: undoIcon,
  source: sourceIcon,
  insert_html: insertHtmlIcon,
  boilerplate: boilerplateIcon,
  mt_table: tableIcon,
  mt_link: linkIcon,
  mt_unlink: unlinkIcon,
  bold: boldIcon,
  italic: italicIcon,
  underline: underlineIcon,
  strike: strikeIcon,
  blockquote: blockquoteIcon,
  clean: cleanIcon,
  align: { // TBD: highlight?
    "": alignleftIcon,
    "center": aligncenterIcon,
    "right": alignrightIcon,
  },
  indent: {
    "+1": indentIcon,
    "-1": unindentIcon,
  },
});

export { icons };
