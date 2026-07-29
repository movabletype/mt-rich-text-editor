import { sha1 } from "@noble/hashes/legacy.js";
import { bytesToHex } from "@noble/hashes/utils.js";

const DATA_URL_RE = /^data:([^,]*),([\s\S]*)$/;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

const isHexDigit = (byte: number | undefined): boolean =>
  byte !== undefined &&
  ((byte >= 0x30 && byte <= 0x39) ||
    (byte >= 0x41 && byte <= 0x46) ||
    (byte >= 0x61 && byte <= 0x66));

const percentDecodeBytes = (input: string): Uint8Array<ArrayBuffer> => {
  const encoded = new TextEncoder().encode(input);
  const decoded = new Uint8Array(encoded.length);
  let length = 0;
  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === 0x25 /* % */ && isHexDigit(encoded[i + 1]) && isHexDigit(encoded[i + 2])) {
      decoded[length++] = parseInt(String.fromCharCode(encoded[i + 1], encoded[i + 2]), 16);
      i += 2;
    } else {
      decoded[length++] = encoded[i];
    }
  }
  return decoded.slice(0, length);
};

const extensionFromMime = (mime: string): string => {
  const known = MIME_TO_EXTENSION[mime];
  if (known) {
    return known;
  }

  const subtype = mime.split("/")[1] ?? "";
  return subtype.replace(/\+.*$/, "") || "bin";
};

export const dataURLToFile = (dataURL: string): File | null => {
  const match = dataURL.match(DATA_URL_RE);
  if (!match) {
    return null;
  }

  const [, meta, data] = match;
  const metaParts = meta.split(";");
  const mime = (metaParts[0] || "").toLowerCase();
  const isBase64 = metaParts.slice(1).some((part) => part.trim().toLowerCase() === "base64");

  if (!mime.startsWith("image/")) {
    return null;
  }

  let bytes: Uint8Array<ArrayBuffer>;
  if (isBase64) {
    try {
      const binaryString = atob(data.replace(/\s/g, ""));
      bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    } catch {
      return null;
    }
  } else {
    bytes = percentDecodeBytes(data);
  }

  const ext = extensionFromMime(mime);
  return new File([bytes], `${bytesToHex(sha1(bytes))}.${ext}`, { type: mime });
};
