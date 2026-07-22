import type { UploadSessionResult } from "@movabletype/mt-rich-text-editor";

export interface LegacyUploadReference {
  index: number;
  assetId?: string;
  assetUrl?: string;
}

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

const findAssetId = (element: Element): string | undefined => {
  for (let current: Element | null = element; current; current = current.parentElement) {
    const assetId = current.getAttribute("data-mt-asset-id") || current.getAttribute("mt:asset-id");
    if (assetId) {
      return assetId;
    }
  }
  return undefined;
};

const normalizeURL = (value: string): string => {
  try {
    return new URL(value, document.baseURI).href;
  } catch {
    return value;
  }
};

export const toLegacyUploadResultsFromHTML = (
  html: string,
  references: LegacyUploadReference[]
): UploadSessionResult[] => {
  const template = document.createElement("template");
  template.innerHTML = html;
  const images = Array.from(template.content.querySelectorAll<HTMLImageElement>("img[src]"));
  const elements: Element[] = images.length
    ? images
    : Array.from(template.content.querySelectorAll<HTMLAnchorElement>("a[href]"));

  const referencesByAssetId = new Map<string, LegacyUploadReference>();
  const referencesByAssetUrl = new Map<string, LegacyUploadReference>();
  references.forEach((reference) => {
    if (reference.assetId) referencesByAssetId.set(reference.assetId, reference);
    if (reference.assetUrl) referencesByAssetUrl.set(normalizeURL(reference.assetUrl), reference);
  });

  return elements.flatMap((element) => {
    const assetId = findAssetId(element);
    const assetUrl = element.getAttribute(element.tagName === "IMG" ? "src" : "href");
    if (!assetUrl) {
      return [];
    }
    const reference =
      (assetId ? referencesByAssetId.get(assetId) : undefined) ||
      referencesByAssetUrl.get(normalizeURL(assetUrl));
    if (!reference) {
      return [];
    }

    const attributes: Record<string, string> = { src: assetUrl };
    const resolvedAssetId = assetId || reference.assetId;
    if (resolvedAssetId) {
      attributes["data-mt-asset-id"] = resolvedAssetId;
    }
    return [{ index: reference.index, attributes }];
  });
};
