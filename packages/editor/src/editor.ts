import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import Quill from "quill";

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
      toolbar: [[{ header: [1, 2, false] }], ["bold", "italic", "underline"]],
    },
    theme: "snow",
  });

  quill.on("text-change", () => {
    textarea.value = editor.innerHTML;
  });

  return quill;
};
