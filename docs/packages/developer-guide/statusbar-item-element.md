# ステータスバーのカスタマイズ

ここでは、以下の3つのカスタマイズ方法について説明します。

* アイテムの配置の変更
* アイテム毎のオプションの変更
* 新しいアイテムの追加

## アイテムの配置の変更 (`options.statusbar`)

### デフォルトで利用可能なアイテム

以下のアイテムがデフォルトで利用可能です。

* `path` カーソル位置のHTML要素の階層の表示

### エディタのオプションでの指定方法

アイテム名を、以下の構造を持つ2次元の配列で指定します。

* 左右の配置
    * 最初の要素を左に配置、2番目の要素を右に配置
* アイテム名

```typescript
MTRichTextEditor.on("create", (options) => {
  options.statusbar = [
      [],       // 左に配置
      ['path'], // 右に配置
  ];
});
```

## アイテム毎のオプションの変更 (`options.statusbarOptions`)

### エディタのオプションでの指定方法

アイテム名をキーとして、アイテム毎のオプションを指定します。

現在、デフォルトのアイテムではオプションを受け取るものはありません。

`false` を指定するとアイテムを無効化することができます。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.statusbarOptions = {
    path: false,
  };
});
```

## 新しいアイテムの追加

[StatusbarItemElement](https://github.com/movabletype/mt-rich-text-editor-internal/blob/main/packages/editor/src/statusbar/item/element.ts#L3-L27)を拡張したクラスを[カスタム要素](https://developer.mozilla.org/ja/docs/Web/API/Web_components/Using_custom_elements)として登録することで、ステータスバーのアイテムとして指定できるようになります。

以下が簡単な実装例です。`mt-rich-text-editor-statusbar-item-${itemName}` という名前でカスタム要素を登録することで、`itemName` をアイテム名としてステータスバーに指定できるようになります。

```typescript
customElements.define(
  "mt-rich-text-editor-statusbar-item-myitem",
  class extends StatusbarItemElement {
    constructor() {
      super();
      const button = document.createElement("button");
      button.textContent = "My Item";
      this.shadowRoot.appendChild(button);
    }

    onEditorUpdate() {
      const tiptap = this.tiptap;
      // update the item
    }
  }
);
```

より実践的な実装例は以下のサンプルプラグインを参照してください。
<ul>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-linter">MTRichTextEditorLinter</a></li>
</ul>
