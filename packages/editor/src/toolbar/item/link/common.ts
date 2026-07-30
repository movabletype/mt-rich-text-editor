import { mount, unmount } from "svelte";
import { Editor as TiptapEditor } from "@tiptap/core";
import { Mark as ProseMirrorMark } from "@tiptap/pm/model";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { LinkData } from "../../../ui/link/Modal.svelte";
import LinkModal from "../../../ui/link/Modal.svelte";

export type Options = {
  readonly defaultTarget?: LinkData["target"];
};

type LinkMark = {
  type: string;
  attrs: Record<string, unknown>;
};

type EditableLinkSelection = {
  text: string;
  marks: LinkMark[];
};

const toLinkMark = (mark: ProseMirrorMark): LinkMark => ({
  type: mark.type.name,
  attrs: mark.attrs,
});

const getEditableLinkSelection = (tiptap: TiptapEditor): EditableLinkSelection | undefined => {
  const { doc, selection } = tiptap.state;

  if (selection.empty) {
    return {
      text: "",
      marks: [],
    };
  }

  if (!selection.$from.sameParent(selection.$to) || !selection.$from.parent.isTextblock) {
    return undefined;
  }

  const parentPos = selection.$from.before(selection.$from.depth);
  let hasText = false;
  let isTextOnly = true;
  let selectedMarks: readonly ProseMirrorMark[] | undefined;

  doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (!isTextOnly) {
      return false;
    }

    if (node.isText) {
      if (selectedMarks && !ProseMirrorMark.sameSet(selectedMarks, node.marks)) {
        isTextOnly = false;
        return false;
      }

      hasText = true;
      selectedMarks ??= node.marks;
      return;
    }

    if (node.type.name === "doc" || pos === parentPos) {
      return;
    }

    isTextOnly = false;
    return false;
  });

  if (!isTextOnly || !hasText) {
    return undefined;
  }

  return {
    text: doc.textBetween(selection.from, selection.to),
    marks: (selectedMarks ?? []).map(toLinkMark),
  };
};

export const onClickFunction =
  (tiptap: TiptapEditor | undefined, options: Options = {}) =>
  () => {
    if (!tiptap) {
      return;
    }
    const isLinkActive = tiptap.isActive("link");
    if (isLinkActive) {
      tiptap.chain().extendMarkRange("link").run();
    }
    const editableSelection = getEditableLinkSelection(tiptap);
    let linkData: LinkData;
    if (isLinkActive) {
      const attrs = tiptap.getAttributes("link");
      linkData = {
        url: attrs.href || "",
        text: editableSelection?.text,
        title: attrs.title || "",
        target: attrs.target || options.defaultTarget || "_self",
      };
    } else {
      linkData = {
        url: "",
        text: editableSelection?.text,
        title: "",
        target: options.defaultTarget || "_self",
      };
    }

    const modal = mount(LinkModal, {
      target: document.body,
      props: {
        linkData,
        onSubmit: (linkData: LinkData) => {
          const chain = tiptap.chain().focus();

          if (tiptap.isActive("link")) {
            chain.extendMarkRange("link");
          }

          const attrs = {
            href: linkData.url,
            target: linkData.target,
            title: linkData.title,
          };

          if (linkData.text === undefined) {
            chain.setMark("link", attrs);
          } else {
            const marks = (editableSelection?.marks ?? [])
              .filter((mark) => mark.type !== "link")
              .concat({
                type: "link",
                attrs,
              });

            chain.deleteSelection().insertContent({
              type: "text",
              text: linkData.text,
              marks,
            });
          }

          chain.run();
        },
        onClose: () => {
          unmount(modal);
        },
      },
    });
  };
