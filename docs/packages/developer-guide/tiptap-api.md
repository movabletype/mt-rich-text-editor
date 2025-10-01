# TiptapのAPIの利用

ここでは、TiptapのAPIを直接利用してエディタの機能を拡張する方法について説明します。

## TiptapのExtensionによる拡張

動的に読み込むことになるので制限はありますが、 `@tiptap/core` からエクスポートされる [Extension](https://tiptap.dev/docs/editor/core-concepts/extensions) を利用して独自のExtensionを定義し、エディタに組み込むことができます。

`MTRichTextEditor.import("@tiptap/core")` 実行すると `@tiptap/core` のインポート結果で解決されるPromiseが返されます。これを利用すると `Extension` や `InputRule` を使って独自のExtensionを定義できます。

```typescript
MTRichTextEditor.import("@tiptap/core").then(({ Extension, InputRule }) => {
  const myTiptapExtension = Extension.create({
    name: "myExtension",
    addInputRules() {
      return [
        new InputRule({
          find: /:\+1:/,
          handler: ({ state, range, match }) => {
            state.tr.insertText("👍", range.from, range.to);
          },
        }),
      ];
    },
  });

  // install the extension
  MTRichTextEditor.on("create", (options) => {
    options.extensions.push(myTiptapExtension);
  });
});
```

より実践的な実装例は以下のサンプルプラグインを参照してください。
<ul>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-extension-emoji">MTRichTextEditorExtensionEmoji</a></li>
</ul>
