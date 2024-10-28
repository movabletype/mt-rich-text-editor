export function initButton(el: HTMLElement, callback: () => Promise<void>): void {
  let doClick = false;
  el.addEventListener(
    "click",
    async (ev) => {
      if (doClick) {
        doClick = false;
        return;
      }

      ev.stopImmediatePropagation();
      ev.stopPropagation();
      ev.preventDefault();

      await callback();
      doClick = true;
      el.click();
    },
    {
      capture: true,
    }
  );
}
