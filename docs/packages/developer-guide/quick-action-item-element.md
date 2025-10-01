---
description: クイックアクションのカスタマイズ方法について説明します。
---

# クイックアクションのカスタマイズ

ここでは、以下の3つのカスタマイズ方法について説明します。

* アイテムの配置の変更
* アイテム毎のオプションの変更
* 新しいアイテムの追加

## アイテムの配置の変更 (`options.quickAction`)

### デフォルトで利用可能なアイテム

以下のアイテムがデフォルトで利用可能です。オプションを指定できるアイテムについては、オプションの内容も記載しています。

* `heading` 見出し
    * バリエーションとして `1` から `6` までの数字を指定できます (例: `heading:2`)

### エディタのオプションでの指定方法

アイテム名を配列で指定します。クイックアクションでは（アイテムがサポートしていれば）`:` に続けて文字列を渡すことで異なるバリエーションとして指定することができます。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.quickAction = [
    'heading:3',
    'heading:4',
  ];
});
```

## アイテム毎のオプションの変更 (`options.quickActionOptions`)

### エディタのオプションでの指定方法

アイテム名をキーとして、アイテム毎のオプションを指定します。

現在、デフォルトのアイテムではオプションを受け取るものはありません。

`false` を指定するとアイテムを無効化することができます。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.quickActionOptions = {
    "heading:1": false,
    "heading:2": false,
  };
});
```

## 新しいアイテムの追加

[QuickActionItemElement](https://github.com/movabletype/mt-rich-text-editor/blob/main/packages/editor/src/quick-action/item/element.ts#L9-L74)を拡張したクラスを[カスタム要素](https://developer.mozilla.org/ja/docs/Web/API/Web_components/Using_custom_elements)として登録することで、クイックアクションのアイテムとして指定できるようになります。

### QuickActionItemElementのメソッド

また拡張したクラスでは以下のユーティリティメソッドを利用できます。

<dl>
<dt>insertContent(content): <code>void</code></dt>
<dd>`content` をエディタに挿入します。Tiptapの[insertContent](https://tiptap.dev/docs/editor/api/commands/content/insert-content)コマンドの引数と同じ型を渡すことができます。</dd>
</dl>

以下が簡単な実装例です。`mt-rich-text-editor-quick-action-${itemName}` という名前でカスタム要素を登録することで、`itemName` をアイテム名としてクイックアクションに指定できるようになります。

```typescript
customElements.define(
  "mt-rich-text-editor-quick-action-item-myitem",
  class extends QuickActionItemElement {
    constructor() {
      super();

      // The string specified in `this.aliases` is the target of the search.
      this.aliases = ["myitem"];

      const button = document.createElement("button");
      this.shadowRoot.appendChild(button);

      const icon = document.createElement("span");
      icon.classList.add("icon");
      icon.innerHTML = `<svg
                         xmlns="http://www.w3.org/2000/svg"
                         width="24"
                         height="24"
                         viewBox="0 0 24 24"
                       >
                         <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle">
                           MI
                         </text>
                       </svg>`;
      button.appendChild(icon);

      const title = document.createElement("span");
      title.textContent = "My Item";
      button.appendChild(title);

      this.addEventListener("click", () => {
        this.insertContent("<p>This is my item!</p>");
      });
    }
  }
);
```

より実践的な実装例は以下のサンプルプラグインを参照してください。
<ul>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-insert-onthisday">MTRichTextEditorInsertOnThisDay</a></li>
</ul>
