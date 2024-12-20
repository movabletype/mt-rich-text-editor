export function openDialog(params: URLSearchParams) {
  const url = new URL(window.ScriptURI);
  url.search = params.toString();
  window.jQuery.fn.mtModal.open(url.toString(), { large: true });
  const modalClose = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      window.jQuery.fn.mtModal.close();
      window.jQuery("body").off("keyup", modalClose);
    }
  };
  window.jQuery("body").on("keyup", modalClose);
}
