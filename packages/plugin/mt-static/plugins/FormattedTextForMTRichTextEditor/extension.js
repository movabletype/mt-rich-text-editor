const scriptElm = document.querySelector('script[data-formatted-text-for-mt-rich-text-editor]');
const boilerplates = JSON.parse(scriptElm.getAttribute('data-formatted-text-for-mt-rich-text-editor'));

boilerplates.forEach((boilerplate) => {
  customElements.define(`mt-rich-text-editor-quick-action-item-boilerplate-${boilerplate.id}`, class extends MTRichTextEditor.QuickActionItemElement {
    constructor() {
      super();
      const shadow = this.shadowRoot;

      const button = document.createElement("button");
      shadow.appendChild(button);

      const icon = document.createElement("img");
      icon.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-template"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 1a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1z" /><path d="M4 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M14 12l6 0" /><path d="M14 16l6 0" /><path d="M14 20l6 0" /></svg>');
      icon.classList.add("icon");
      button.appendChild(icon);

      const title = document.createElement("span");
      title.textContent = boilerplate.title;
      button.appendChild(title);
    }

    onEditorInit(editor, options) {
      this.editor = editor;
      this.options = options;
    }

    aliases = boilerplate.aliases ? JSON.parse(boilerplate.aliases) : [boilerplate.text.match(/<(\w+)/)?.[1]];

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
