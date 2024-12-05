import icons from "quill/ui/icons";
import hrIcon from "./icons/hr.svg?raw";
import redoIcon from "./icons/redo.svg?raw";
import undoIcon from "./icons/undo.svg?raw";
import insertHtmlIcon from "./icons/insert_html.svg?raw";
import sourceIcon from "./icons/source.svg?raw";
import linkIcon from "./icons/link.svg?raw";
import unlinkIcon from "./icons/unlink.svg?raw";

Object.assign(icons, {
  hr: hrIcon,
  redo: redoIcon,
  undo: undoIcon,
  source: sourceIcon,
  insert_html: insertHtmlIcon,
  mt_link: linkIcon,
  mt_unlink: unlinkIcon,
});

export { icons };
