---
description: ツールバーのカスタマイズ方法について説明します。
---

# ツールバーのカスタマイズ

ここでは、以下の3つのカスタマイズ方法について説明します。

* アイテム（ボタンやドロップダウンリスト）の配置の変更
* アイテム毎のオプションの変更
* 新しいアイテムの追加

## アイテムの配置の変更 (`options.toolbar`)

### デフォルトで利用可能なアイテム

以下のアイテムがデフォルトで利用可能です。オプションを指定できるアイテムについては、オプションの内容も記載しています。

* `bold` 太字
* `italic` 斜体
* `underline` 下線
* `strike` 取り消し線
* `blockquote` 引用
* `bulletList` 箇条書き
* `orderedList` 番号付き箇条書き
* `horizontalRule` 水平罫線
* `link` リンク
  * <dl><dt>defaultTarget : <code>"_self" | "_blank"</code></dt><dd>リンクターゲットの既定値</dd></dl>
* `unlink` リンクを解除
* `insertHtml` HTMLの挿入
* `file` アセットの挿入
* `image` 画像の挿入
* `table` 表
* `source` HTML編集モードへの切り替え
* `undo` 元に戻す
* `redo` やり直す
* `foregroundColor` テキストの色
  * <dl><dt>presetColors : <code>string[]</code></dt><dd>カラーパレットに表示する色の配列 (例: <code>["#000000", "#ffffff", "#ff0000"]</code>)</dd></dl>
* `backgroundColor` ハイライトの色
  * <dl><dt>presetColors : <code>string[]</code></dt><dd>カラーパレットに表示する色の配列 (例: <code>["#000000", "#ffffff", "#ff0000"]</code>)</dd></dl>
* `removeFormat` 書式をクリア
* `alignLeft` 左揃え
* `alignCenter` 中央揃え
* `alignRight` 右揃え
* `indent` インデントを増やす
* `outdent` インデントを減らす
* `block` 段落スタイル
* `fullScreen` フルスクリーン
* `structure` HTML構造編集モードへの切り替え

### エディタのオプションでの指定方法

アイテム名を、以下の構造を持つ4次元の配列で指定します。

* 行
* 左右の配置
    * 最初の要素を左に配置、2番目の要素を右に配置
* グループ
    * グループ毎に区切られて配置
* アイテム名

```typescript
MTRichTextEditor.on("create", (options) => {
  options.toolbar = [
    [ // 1行目
      [ // 左に配置
        [ 'bold', 'italic', 'underline' ], // グループ1
        [ 'strike' ],                     // グループ2
      ],
      [ // 右に配置
        [ 'undo', 'redo' ],
      ],
    ],
    [ // 2行目
      [
        [ 'link', 'unlink' ],
        [ 'insertHtml' ],
      ],
      [
        [ 'source' ],
      ],
    ],
  ];
});
```

具体的な指定方法は以下のサンプルプラグインを参照してください。
<ul>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-options">MTRichTextEditorOptions</a></li>
</ul>

## アイテム毎のオプションの変更 (`options.toolbarOptions`)

### エディタのオプションでの指定方法

アイテム名をキーとして、アイテム毎のオプションを指定します。

```typescript
const colors = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#00ffff",
  "#ff00ff",
];
MTRichTextEditor.on("create", (options) => {
  options.toolbarOptions = {
    link: {
      defaultTarget: "_blank",
    },
    foregroundColor: {
      presetColors: colors,
    },
    backgroundColor: {
      presetColors: colors,
    },
  };
});
```

`false` を指定するとアイテムを無効化することができます。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.toolbarOptions = {
    image: false,
  };
});
```

## 新しいアイテムの追加

[ToolbarItemElement](https://github.com/movabletype/mt-rich-text-editor-internal/blob/main/packages/editor/src/toolbar/item/element.ts#L8-L48)を拡張したクラスを[カスタム要素](https://developer.mozilla.org/ja/docs/Web/API/Web_components/Using_custom_elements)として登録することで、ツールバーのアイテムとして指定できるようになります。

以下が簡単な実装例です。`mt-rich-text-editor-toolbar-item-${itemName}` という名前でカスタム要素を登録することで、`itemName` をアイテム名としてツールバーに指定できるようになります。

```typescript
customElements.define(
  "mt-rich-text-editor-toolbar-item-myitem",
  class extends ToolbarItemElement {
    constructor() {
      super();
      const button = document.createElement("button");
      button.title = "My Item";
      button.textContent = "My Item";
      this.shadowRoot.appendChild(button);
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("click", () => {
        this.tiptap?.commands.insertContent("<p>Hello</p>");
      });
    }
  }
);
```

より実践的な実装例は以下のサンプルプラグインを参照してください。
<ul>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-insert-table">MTRichTextEditorInsertTable</a></li>
</ul>
