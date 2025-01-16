const scriptElm = document.querySelector('script[data-formatted-text-for-mt-rich-text-editor]');
const boilerplates = JSON.parse(scriptElm.getAttribute('data-formatted-text-for-mt-rich-text-editor'));

boilerplates.forEach((boilerplate) => {
  customElements.define(`mt-rich-text-editor-quick-action-item-boilerplate-${boilerplate.id}`, class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML = boilerplate.title;
    }

    onEditorInit(editor, options) {
      this.editor = editor;
      this.options = options;
    }

    aliases = [boilerplate.text.match(/<(\w+)/)?.[1]];

    connectedCallback() {
      this.addEventListener("click", () => {
        console.log(this.editor, this.options);
        this.editor.tiptap
          ?.chain()
          .focus()
          .selectParentNode()
          // .deleteSelection()
          .insertContent(boilerplate.text)
          .run();
      });
    }
  });
});

MTRichTextEditor.on("create", (config) => {
  config.toolbarOptions = {
    ...config.toolbarOptions,
    boilerplate: boilerplates.length === 0 ? false : {
      boilerplates,
    },
  };

  config.quickAction = [
    ...config.quickAction,
    ...boilerplates.map((boilerplate) => `boilerplate-${boilerplate.id}`)
  ]
});
