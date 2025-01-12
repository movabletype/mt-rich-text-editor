import { JSDOM } from "jsdom";

globalThis.window = new JSDOM().window;

import("./editor").then(({ Editor }) => {
  const textarea = window.document.createElement("textarea");
  window.document.body.appendChild(textarea);
  const editor = new Editor(textarea, {
    toolbar: [],
    inline: true,
  });
  
  // get content from stdin
  const content = process.stdin.read();
  editor.setContent(content);
  if (editor.getContent() !== content) {
    console.error("Content mismatch");
    process.exit(1);
  }
  
  process.exit(0);
});


