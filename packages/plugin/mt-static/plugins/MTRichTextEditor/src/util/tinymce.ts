/**
 * Migration utility functions from TinyMCE
 */

import type { EditorCreateOptions } from "@movabletype/mt-rich-text-editor";

const toolbarMigrationMap: Record<string, string> = {
  strikethrough: "strike",
  bullist: "bulletList",
  numlist: "orderedList",
  forecolor: "foregroundColor",
  backcolor: "backgroundColor",
  removeformat: "removeFormat",
  alignleft: "alignLeft",
  aligncenter: "alignCenter",
  alignright: "alignRight",
  blocks: "block",
};

const isEditorOptionsToolbar = (
  toolbar: string[] | EditorCreateOptions["toolbar"]
): toolbar is EditorCreateOptions["toolbar"] => !toolbar || Array.isArray(toolbar[0]);

export const convertToolbar = (
  toolbar: string[] | EditorCreateOptions["toolbar"]
): EditorCreateOptions["toolbar"] => {
  if (isEditorOptionsToolbar(toolbar)) {
    return toolbar;
  }

  return toolbar.map((row) =>
    row
      .split("|")
      .map((group) =>
        group
          .trim()
          .split(/\s*,\s*|\s+/)
          .map((item) => item.trim())
          .map((item) => toolbarMigrationMap[item] || item)
      )
  );
};
