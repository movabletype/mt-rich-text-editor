import { mount, unmount } from "svelte";
import { Editor as TiptapEditor } from "@tiptap/core";
// @ts-ignore
import type { LinkData } from "../../../ui/link/Modal.svelte";
import LinkModal from "../../../ui/link/Modal.svelte";

export const onClickFunction = (tiptap: TiptapEditor | undefined) => () => {
  if (!tiptap) {
    return;
  }
  let linkData: LinkData;
  if (tiptap.isActive("link")) {
    tiptap.chain().extendMarkRange("link").run();

    const linkText = tiptap.state.doc.textBetween(
      tiptap.state.selection.from,
      tiptap.state.selection.to
    );

    const attrs = tiptap.getAttributes("link");
    linkData = {
      url: attrs.href || "",
      text: linkText,
      title: attrs.title || "",
      target: attrs.target || "_self",
    };
  } else {
    linkData = {
      url: "",
      text: tiptap.state.selection.empty
        ? ""
        : tiptap.state.doc.textBetween(tiptap.state.selection.from, tiptap.state.selection.to),
      title: "",
      target: "_self",
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

        chain
          .deleteSelection()
          .insertContent({
            type: "text",
            text: linkData.text,
            marks: [
              {
                type: "link",
                attrs: {
                  href: linkData.url,
                  target: linkData.target,
                  title: linkData.title,
                },
              },
            ],
          })
          .run();
      },
      onClose: () => {
        unmount(modal);
      },
    },
  });
};
