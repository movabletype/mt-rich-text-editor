import type { Asset } from "@movabletype/app/object";

declare global {
  interface MTAsset extends Asset {
    file_name?: string;
  }

  /** Flat insert-option record the AssetUploader insert callback delivers per asset. */
  interface MTAssetUploaderInsertedAsset {
    assetId?: string;
    assetUrl?: string;
    assetWidth?: string;
    assetHeight?: string;
    assetThumbnailUrl?: string;
    assetThumbnailWidth?: string;
    assetThumbnailHeight?: string;
    align?: string;
    alternativeText?: string;
    caption?: string;
    linkToOriginal?: string;
    width?: string;
    html?: string;
  }

  interface MTAssetUploaderOpenOptions {
    selectMetaData: boolean;
    multiSelect: boolean;
    params: Record<string, unknown>;
    initialSelectedData: unknown[];
    field: string;
    files?: File[];
    insert?: (data: MTAssetUploaderInsertedAsset[]) => void;
    close?: () => void;
  }

  interface MTAssetUploader {
    open(options: MTAssetUploaderOpenOptions): void;
  }
}

export {};
