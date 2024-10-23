import Quill from "quill";
import "./blots";
import "./themes/mt";
import "./themes/mt.css";

export const create = async (selector: string) => {
  const textarea = document.querySelector<HTMLTextAreaElement>(selector);
  if (!textarea) {
    throw new Error("Textarea not found");
  }
  const editor = document.createElement("div");
  textarea.style.display = "none";
  textarea.parentNode?.insertBefore(editor, textarea.nextSibling);

  editor.innerHTML = textarea.value;

  const quill = new Quill(editor, {
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", { list: "ordered" }, { list: "bullet" }, "hr"],
        ["link"],
        ["undo", "redo"],
        [{ color: [] }, { background: [] }, "clean"],
        [{ align: [] }, { align: "center" }, { align: "right" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ header: [] }],
      ],
    },
    theme: "mt",
  });

  return {
    save() {
      const contents = quill.root.cloneNode(true) as HTMLElement;
      textarea.value = contents.innerHTML;
    },
    quill,
  };
};
