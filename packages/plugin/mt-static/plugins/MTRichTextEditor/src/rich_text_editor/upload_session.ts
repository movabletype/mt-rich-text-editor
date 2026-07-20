import type { UploadSessionResult } from "@movabletype/mt-rich-text-editor";

const extensionOf = (path: string): string => {
  const basename = path.split(/[?#]/)[0].split("/").pop() ?? "";
  const dotIndex = basename.lastIndexOf(".");
  return dotIndex === -1 ? "" : basename.slice(dotIndex + 1).toLowerCase();
};

export const toUploadResults = (
  data: MTAssetUploaderInsertedAsset[],
  files: File[]
): UploadSessionResult[] => {
  const results: UploadSessionResult[] = [];
  let index = 0;

  for (const entry of [...data].reverse()) {
    if (!entry?.assetUrl) {
      continue;
    }

    const extension = extensionOf(entry.assetUrl);
    while (index < files.length && extensionOf(files[index].name) !== extension) {
      index++;
    }
    if (index >= files.length) {
      break;
    }

    const attributes: Record<string, string> = { src: entry.assetUrl };
    if (entry.assetId) {
      attributes["data-mt-asset-id"] = String(entry.assetId);
    }
    results.push({ index: index++, attributes });
  }

  return results;
};
