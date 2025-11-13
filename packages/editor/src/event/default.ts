import type { Events } from ".";

export const previewIframe = (data: Events["previewIframe"]) => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(data.content, "text/html");
  if (
    [...doc.body.children].every(
      (e) => e instanceof HTMLIFrameElement && /^https:\/\/www.youtube.com\//.test(e.src)
    )
  ) {
    // YouTube iframe only
    data.sourceType = "srcdoc";
  } else if (/^https:\/\/www.tiktok.com\//.test(doc.body.querySelector("script")?.src || "")) {
    // Include TikTok embed script
    data.sourceType = "data-wrap";
  }
};
