const scriptElm = document.querySelector('script[data-formatted-text-for-mt-rich-text-editor]');
const boilerplates = JSON.parse(scriptElm.getAttribute('data-formatted-text-for-mt-rich-text-editor'));
MT.Editor.MTRichTextEditor.config.toolbar[0].splice(-1, 0, ["boilerplate"]);
MT.Editor.MTRichTextEditor.config.context = {
  boilerplates
}
