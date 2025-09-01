let updateHeight: (() => void) | undefined;
export const toggleFullScreen = (id: string) => {
  const editor = document.querySelector<HTMLTextAreaElement>(`#${id}`);
  if (!editor) {
    throw new Error(`textarea not found: ${id}`);
  }
  const parent = editor.closest("#text-field") || editor.closest(".editor-content");
  if (!parent) {
    throw new Error(`parent not found: ${id}`);
  }

  if (parent.classList.contains("mt-rich-text-editor-fullscreen")) {
    parent.classList.remove("mt-rich-text-editor-fullscreen");
    editor.style.height = "";
    if (updateHeight) {
      window.removeEventListener("resize", updateHeight);
      updateHeight = undefined;
    }
  } else {
    parent.classList.add("mt-rich-text-editor-fullscreen");

    updateHeight = () => {
      const tabHeight = parent.querySelector("#editor")?.clientHeight || 0;
      const toolbarHeight =
        parent.querySelector(".mt-rich-text-editor-source-editor-toolbar, .ql-toolbar")
          ?.clientHeight || 0;
      editor.style.height = `calc(100vh - ${tabHeight + toolbarHeight + 1}px)`;
      editor.style.resize = "none";
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
  }
};
