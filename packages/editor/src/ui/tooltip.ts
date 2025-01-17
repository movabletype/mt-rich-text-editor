import { mount, unmount } from "svelte";
import Tooltip from "./Tooltip.svelte";

const DEFAULT_SHOW_DELAY = 500;
const ACTIVE_SHOW_DELAY = 10;
const RESET_DELAY = 1000;

let showCount = 0;
let showDelay = DEFAULT_SHOW_DELAY;
let resetTimerId: ReturnType<typeof setTimeout> | undefined;

export const tooltip = (node: HTMLElement, title: string) => {
  let tooltipMount: ReturnType<typeof mount> | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  node.title = title;
  node.addEventListener("mouseenter", () => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      if (tooltipMount) {
        return;
      }
      node.title = "";
      node.setAttribute("aria-describedby", "mt-rich-text-editor-tooltip");
      tooltipMount = mount(Tooltip, {
        target: node,
        props: {
          title,
        },
      });
      showCount++;
      showDelay = ACTIVE_SHOW_DELAY;
    }, showDelay);
  });
  node.addEventListener("mouseleave", () => {
    clearTimeout(timerId);

    if (!tooltipMount) {
      return;
    }
    node.title = title;
    node.removeAttribute("aria-describedby");
    unmount(tooltipMount);
    tooltipMount = undefined;
    showCount--;

    clearTimeout(resetTimerId);
    resetTimerId = setTimeout(() => {
      if (showCount === 0) {
        showDelay = DEFAULT_SHOW_DELAY;
      }
    }, RESET_DELAY);
  });
};
