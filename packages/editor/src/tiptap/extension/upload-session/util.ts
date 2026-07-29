import { dataURLToFile } from "../../../util/data-url";

export const UPLOAD_SESSION_ID_ATTRIBUTE = "data-mt-rich-text-editor-upload-session";
export const UPLOAD_SESSION_INDEX_ATTRIBUTE = "data-mt-rich-text-editor-upload-session-index";

const REMOVABLE_EMPTY_ANCESTOR_TAG_NAMES = new Set(["SPAN", "A", "P"]);

let uploadSessionCounter = 0;

export const createUploadSessionId = (): string => `upload-session-${++uploadSessionCounter}`;

const isEmptyElement = (element: Element): boolean =>
  [...element.childNodes].every(
    (node) => node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()
  );

const removeEmptyAncestors = (element: Element) => {
  let current: Element | null = element;
  while (
    current &&
    REMOVABLE_EMPTY_ANCESTOR_TAG_NAMES.has(current.tagName) &&
    isEmptyElement(current)
  ) {
    const parent: Element | null = current.parentElement;
    current.remove();
    current = parent;
  }
};

export const removeUploadSessionImages = (root: HTMLElement, sessionId: string): void => {
  root
    .querySelectorAll<HTMLImageElement>(`img[${UPLOAD_SESSION_ID_ATTRIBUTE}="${sessionId}"]`)
    .forEach((image) => {
      const parent = image.parentElement;
      image.remove();
      if (parent) {
        removeEmptyAncestors(parent);
      }
    });
};

interface CollectDataURLImageFilesOptions {
  sessionId: string;
  shouldUpload: (file: File) => boolean;
}

export const collectDataURLImageFiles = (
  root: HTMLElement,
  options: CollectDataURLImageFilesOptions
): File[] => {
  const files: File[] = [];

  root.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src")?.trim();
    if (!src || !/^data:/i.test(src)) {
      return;
    }

    const file = dataURLToFile(src);

    if (file && options.shouldUpload(file)) {
      img.setAttribute(UPLOAD_SESSION_ID_ATTRIBUTE, options.sessionId);
      img.setAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE, String(files.length));
      files.push(file);
      return;
    }

    const parent = img.parentElement;
    img.remove();
    if (parent) {
      removeEmptyAncestors(parent);
    }
  });

  return files;
};
