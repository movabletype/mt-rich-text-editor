export const insertStylesheets = async (root: ShadowRoot, stylesheets: string[]): Promise<void> => {
  for (let stylesheet of stylesheets) {
    if (!stylesheet) {
      continue;
    }

    if (/^blob:/.test(stylesheet)) {
      try {
        stylesheet = await (await fetch(stylesheet)).text();
      } catch (e) {
        console.error(e);
        continue;
      }
    } else if (!/^https?:/.test(stylesheet) && /\.css$/i.test(stylesheet)) {
      // assumes `stylesheet` is relative URL
      stylesheet = new URL(stylesheet, window.location.href).href;
    }

    if (/^https?:/.test(stylesheet)) {
      const styleSheet = document.createElement("link");
      styleSheet.rel = "stylesheet";
      styleSheet.href = stylesheet;
      root.appendChild(styleSheet);
    } else {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = stylesheet;
      root.appendChild(styleSheet);
    }
  }
};
