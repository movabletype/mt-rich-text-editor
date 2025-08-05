import { mount, unmount } from "svelte";
import Tooltip from "./Tooltip.svelte";

const DEFAULT_SHOW_DELAY = 1000; // time before tooltip appears in undisplayed state (ms)
const ACTIVE_SHOW_DELAY = 10; // time before tooltip appears once displayed (ms)
const RESET_DELAY = 1000; // time until display state is reset after mouse release (ms)

let showCount = 0;
let showDelay = DEFAULT_SHOW_DELAY;
let resetTimerId: ReturnType<typeof setTimeout> | undefined;

export const tooltip = (node: HTMLElement, title?: string) => {
  let tooltipMount: ReturnType<typeof mount> | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  if (title) {
    node.title = title;
  } else {
    title = node.title;
  }
  if (!title) {
    return;
  }
  node.addEventListener("mouseenter", () => {
    node.title = "";

    clearTimeout(timerId);
    timerId = setTimeout(() => {
      if (tooltipMount) {
        return;
      }
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
    node.title = title;

    clearTimeout(timerId);

    if (!tooltipMount) {
      return;
    }
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
