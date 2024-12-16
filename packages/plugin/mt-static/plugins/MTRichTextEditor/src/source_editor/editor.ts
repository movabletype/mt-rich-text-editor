import { MT } from "@movabletype/app";
import { DEFAULT_HEIGHT } from "../constant";
import { mount, unmount } from "svelte";
import Toolbar from "./Toolbar.svelte";
import LinkModal from "../link/Modal.svelte";
import { toggleFullScreen } from "../utils/full_screen";

function openDialog(mode: string, param: string) {
  var url = window.ScriptURI + "?" + "__mode=" + mode + "&amp;" + param;
  window.jQuery.fn.mtModal.open(url, { large: true });
  var modalClose = function (e: KeyboardEvent) {
    if (e.keyCode == 27) {
      window.jQuery.fn.mtModal.close();
      window.jQuery("body").off("keyup", modalClose as any);
    }
  };
  window.jQuery("body").on("keyup", modalClose as any);
}

export default class SourceEditor {
  private id: string;
  private textarea: HTMLTextAreaElement;
  private editor: any;
  private command: any;
  private toolbar: HTMLDivElement;
  private toolbarMount: ReturnType<typeof mount> | undefined;

  constructor({ id }: { id: string }) {
    this.id = id;
    const textarea = document.querySelector<HTMLTextAreaElement>(`#${id}`);
    if (!textarea) {
      throw new Error(`textarea not found: ${id}`);
    }
    this.textarea = textarea;
    textarea.classList.add("mt-rich-text-editor-source-editor");
    if (!textarea.style.height) {
      textarea.style.height = `${DEFAULT_HEIGHT}px`;
    }

    this.toolbar = document.createElement("div");
    this.textarea.parentElement?.insertBefore(this.toolbar, this.textarea);

    if (!MT.Editor) {
      throw new Error("MT.Editor is not found");
    }
    this.editor = new MT.Editor.Source(id);
    this.command = new MT.EditorCommand.Source(this.editor);
  }

  private unmount(): void {
    if (this.toolbarMount) {
      unmount(this.toolbarMount);
    }
  }

  public unload(): void {
    if (this.toolbarMount) {
      this.unmount();
      this.toolbar.remove();
      this.textarea.classList.remove("mt-rich-text-editor-source-editor");
    }
  }

  public setFormat(format: string): void {
    this.unmount();
    this.command.setFormat(format);
    this.toolbarMount = mount(Toolbar, {
      target: this.toolbar,
      props: {
        command: this.command,
        toggleFullScreen: () => {
          toggleFullScreen(this.id);
        },
        openLinkDialog: () => {
          const selectedText = /^(?:0|__default__)$/.test(format)
            ? this.editor.getSelectedText()
            : "";

          const parser = new DOMParser();
          const doc = parser.parseFromString(selectedText, "text/html");

          const existingLink = doc.querySelector("a");
          const linkData = (
            existingLink
              ? {
                  url: existingLink.getAttribute("href") || "",
                  text: existingLink.textContent || "",
                  title: existingLink.title || "",
                  target: existingLink.target || "_self",
                }
              : {
                  url: "",
                  text: selectedText,
                  title: "",
                  target: "_self",
                }
          ) as {
            url: string;
            text: string;
            title: string;
            target: "_self" | "_blank";
          };
          if (["_self", "_blank"].includes(linkData.target)) {
            linkData.target = "_self";
          }

          const linkModal = mount(LinkModal, {
            target: document.body,
            props: {
              ...linkData,
              onSubmit: (data: any) => {
                this.command.execCommand("createLink", null, data.url, {
                  target: data.target,
                  title: data.title,
                  text: data.text,
                });
              },
              onClose: () => {
                unmount(linkModal);
              },
            },
          });
        },
        openFileDialog: () => {
          this.command.execCommand("mtSaveBookmark");
          const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || 0;
          openDialog(
            "dialog_asset_modal",
            `_type=asset&amp;edit_field=${this.id}&amp;blog_id=${blogId}&amp;dialog_view=1&amp;filter=class&amp;filter_val=image&amp;can_multi=1`
          );
        },
        openImageDialog: () => {
          this.command.execCommand("mtSaveBookmark");
          const blogId = document.querySelector<HTMLInputElement>("[name=blog_id]")?.value || 0;
          openDialog(
            "dialog_asset_modal",
            `_type=asset&amp;edit_field=${this.id}&amp;blog_id=${blogId}&amp;dialog_view=1&amp;can_multi=1`
          );
        },
      },
    });
  }

  public async save(): Promise<void> {
    const contents = this.textarea.value;
    this.textarea.value = contents;
  }

  public insertContent(content: string): void {
    console.log("insertContent", content);
    this.editor.insertContent(content);
  }

  public getContent(): string {
    return this.textarea.value;
  }

  public setContent(content: string): void {
    this.textarea.value = content;
  }

  public getHeight(): number {
    return this.textarea.scrollHeight;
  }

  public setHeight(height: number): void {
    if (height === 0) {
      return;
    }
    this.textarea.style.height = `${height}px`;
  }

  public focus(): void {
    this.textarea.focus();
  }
}
