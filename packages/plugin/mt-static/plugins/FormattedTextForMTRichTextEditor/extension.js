const dataElm = document.querySelector('[data-formatted-text-for-mt-rich-text-editor]');
const boilerplates = JSON.parse(dataElm.dataset.formattedTextForMtRichTextEditor);
const iconString = document.querySelector('#mt-rich-text-editor-boilerplate-icon').innerHTML;

customElements.define(`mt-rich-text-editor-quick-action-item-boilerplate`, class extends MTRichTextEditor.Component.QuickActionItemElement {
  connectedCallback() {
    super.connectedCallback();

    const boilerplate = boilerplates.find((boilerplate) => boilerplate.id === this.variant);
    if (!boilerplate) {
      return;
    }

    this.aliases = boilerplate.aliases ? JSON.parse(boilerplate.aliases) : [boilerplate.text.match(/<(\w+)/)?.[1]];

    const button = document.createElement("button");
    this.shadowRoot.appendChild(button);

    const icon = document.createElement("span");
    icon.classList.add("icon");
    icon.innerHTML = iconString;
    button.appendChild(icon);

    const title = document.createElement("span");
    title.textContent = boilerplate.title;
    button.appendChild(title);

    this.addEventListener("click", () => {
      this.insertContent(boilerplate.text);
    });
  }
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
    ...boilerplates.map((boilerplate) => `boilerplate:${boilerplate.id}`)
  ]
});
