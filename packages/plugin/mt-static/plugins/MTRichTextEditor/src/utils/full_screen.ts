export function toggleFullScreen(id: string) {
  const textarea = document.querySelector<HTMLTextAreaElement>(`#${id}`);
  if (!textarea) {
    throw new Error(`textarea not found: ${id}`);
  }
  const parent = textarea.closest("#text-field") || textarea.closest(".editor-content");
  if (!parent) {
    throw new Error(`parent not found: ${id}`);
  }

  if (parent.classList.contains("mt-rich-text-editor-fullscreen")) {
    parent.classList.remove("mt-rich-text-editor-fullscreen");
    textarea.style.height = "";
  } else {
    parent.classList.add("mt-rich-text-editor-fullscreen");

    const updateHeight = () => {
      const tabHeight = parent.querySelector("#editor")?.clientHeight || 0;
      const toolbarHeight =
        parent.querySelector(".mt-rich-text-editor-source-editor-toolbar")?.clientHeight || 0;
      textarea.style.height = `calc(100vh - ${tabHeight + toolbarHeight + 1}px)`;
      textarea.style.resize = "none";
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
  }
}
