import { Extension } from "@tiptap/core";
import { UPLOAD_SESSION_ID_ATTRIBUTE, UPLOAD_SESSION_INDEX_ATTRIBUTE } from "./util";
import { buildMTRichTextEditorHTMLAttributes } from "../movable-type/global";

export const uploadSessionMetaKey = "uploadSession";

const IMAGE_ATTRIBUTE_NAMES = new Set(["src", "alt", "title", "width", "height"]);

export interface UploadSessionResult {
  index: number;
  attributes: Record<string, string>;
}

export type UploadSessionMeta =
  | {
      type: "apply";
      sessionId: string;
      results: UploadSessionResult[];
      remaining: number;
    }
  | {
      type: "cancel";
      sessionId: string;
    };

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    uploadSession: {
      applyUploadSessionResults: (sessionId: string, results: UploadSessionResult[]) => ReturnType;
      cancelUploadSession: (sessionId: string) => ReturnType;
    };
  }
}

const parseUploadSessionIndex = (element: HTMLElement): number | null => {
  const value = element.getAttribute(UPLOAD_SESSION_INDEX_ATTRIBUTE);
  if (value === null) {
    return null;
  }

  const index = parseInt(value, 10);
  return Number.isNaN(index) ? null : index;
};

export const UploadSession = Extension.create({
  name: "uploadSession",

  addGlobalAttributes() {
    return [
      {
        types: ["image"],
        attributes: {
          uploadSessionId: {
            default: null,
            parseHTML: (element) => element.getAttribute(UPLOAD_SESSION_ID_ATTRIBUTE),
            renderHTML: ({ uploadSessionId }) =>
              uploadSessionId === null ? {} : { [UPLOAD_SESSION_ID_ATTRIBUTE]: uploadSessionId },
          },
          uploadSessionIndex: {
            default: null,
            parseHTML: parseUploadSessionIndex,
            renderHTML: ({ uploadSessionIndex }) =>
              uploadSessionIndex === null
                ? {}
                : { [UPLOAD_SESSION_INDEX_ATTRIBUTE]: uploadSessionIndex },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      applyUploadSessionResults:
        (sessionId, results) =>
        ({ tr, dispatch }) => {
          const resultsByIndex = new Map(results.map((result) => [result.index, result]));
          const matchedIndexes = new Set<number>();

          tr.doc.descendants((node, pos) => {
            if (node.type.name !== "image" || node.attrs.uploadSessionId !== sessionId) {
              return;
            }

            const index = node.attrs.uploadSessionIndex as number | null;
            if (index === null) {
              return;
            }
            const result = resultsByIndex.get(index);
            if (!result) {
              return;
            }

            const htmlAttributes = {
              ...(node.attrs.MTRichTextEditorHTMLAttributes as Record<string, string> | undefined),
            };
            const additionalHTMLAttributes: Record<string, string> = {};
            const attrs: Record<string, unknown> = {
              ...node.attrs,
              uploadSessionId: null,
              uploadSessionIndex: null,
            };

            for (const [name, value] of Object.entries(result.attributes)) {
              if (IMAGE_ATTRIBUTE_NAMES.has(name)) {
                attrs[name] = value;
                delete htmlAttributes[name];
              } else {
                additionalHTMLAttributes[name] = value;
              }
            }

            attrs.MTRichTextEditorHTMLAttributes = {
              ...htmlAttributes,
              ...buildMTRichTextEditorHTMLAttributes(additionalHTMLAttributes),
            };
            tr.setNodeMarkup(pos, undefined, attrs, node.marks);
            matchedIndexes.add(index);
          });

          if (matchedIndexes.size === 0) {
            return false;
          }

          let remaining = 0;
          tr.doc.descendants((node) => {
            if (node.type.name === "image" && node.attrs.uploadSessionId === sessionId) {
              remaining++;
            }
          });

          const appliedResults = results.filter(({ index }) => matchedIndexes.has(index));
          tr.setMeta(uploadSessionMetaKey, {
            type: "apply",
            sessionId,
            results: appliedResults,
            remaining,
          } satisfies UploadSessionMeta);
          tr.setMeta("addToHistory", false);
          dispatch?.(tr);
          return true;
        },

      cancelUploadSession:
        (sessionId) =>
        ({ tr, dispatch }) => {
          let deleted = false;

          const findUploadSessionImagePosition = (): number | null => {
            let uploadSessionImagePosition: number | null = null;
            tr.doc.descendants((node, pos) => {
              if (
                uploadSessionImagePosition === null &&
                node.type.name === "image" &&
                node.attrs.uploadSessionId === sessionId
              ) {
                uploadSessionImagePosition = pos;
              }
            });
            return uploadSessionImagePosition;
          };

          while (true) {
            const pos = findUploadSessionImagePosition();
            if (pos === null) {
              break;
            }

            const image = tr.doc.nodeAt(pos);
            if (!image) {
              break;
            }

            const $pos = tr.doc.resolve(pos);
            const depth = $pos.depth;
            let from = pos;
            let to = pos + image.nodeSize;

            // Cleanup is intentionally limited to the image's immediate wrapper.
            if (depth > 0 && $pos.parent.childCount === 1) {
              const grandparent = $pos.node(depth - 1);
              const parentIndex = $pos.index(depth - 1);
              if (grandparent.canReplace(parentIndex, parentIndex + 1)) {
                from = $pos.before(depth);
                to = $pos.after(depth);
              }
            }

            tr.delete(from, to);
            deleted = true;
          }

          if (!deleted) {
            return false;
          }

          tr.setMeta(uploadSessionMetaKey, {
            type: "cancel",
            sessionId,
          } satisfies UploadSessionMeta);
          tr.setMeta("addToHistory", false);
          dispatch?.(tr);
          return true;
        },
    };
  },
});
