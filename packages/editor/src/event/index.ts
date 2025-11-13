// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler = (data: any) => void;

export interface Events {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  beforeGetContent: {};
  getContent: { content: string };
  setContent: {
    source: "external" | "sourceEditor" | string;
    content: string;
  };
  previewIframe: {
    sourceType: "data" | "data-wrap" | "blob" | "srcdoc";
    content: string;
    sandbox: string;
  };
}
