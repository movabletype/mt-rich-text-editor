/**
 * Migration utility functions from TinyMCE
 */

import type { EditorOptions } from "@movabletype/mt-rich-text-editor";

const toolbarMigrationMap: Record<string, string | Record<string, string | string[]>> = {
  strikethrough: "strike",
  link: "mt_link",
  unlink: "mt_unlink",
  bullist: { list: "bullet" },
  numlist: { list: "ordered" },
  forecolor: { color: [] },
  backcolor: { background: [] },
  removeformat: "clean",
  alignleft: { align: "" },
  aligncenter: { align: "center" },
  alignright: { align: "right" },
  indent: { indent: "+1" },
  outdent: { indent: "-1" },
  blocks: { header: [] },
};

const isEditorOptionsToolbar = (
  toolbar: string[] | EditorOptions["toolbar"]
): toolbar is EditorOptions["toolbar"] => !toolbar || Array.isArray(toolbar[0]);

export const convertToolbar = (
  toolbar: string[] | EditorOptions["toolbar"]
): EditorOptions["toolbar"] => {
  if (isEditorOptionsToolbar(toolbar)) {
    return toolbar;
  }

  const result: (string | Record<string, string | string[]>)[][] = [];
  toolbar.forEach((line) => {
    result.push([]);
    line.split("|").forEach((group) => {
      result.push(
        group
          .trim()
          .split(/\s+|\s*,\s*/)
          .map((item) => item.trim())
          .map((item) => toolbarMigrationMap[item] || item)
      );
    });
  });
  return result.slice(1);
};
