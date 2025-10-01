---
description: 貼り付け形式の追加について説明します。
---

# 貼り付け形式の追加

ここでは、以下の3つのカスタマイズ方法について説明します。

* 利用する貼り付け形式の変更
* 貼り付け形式のオプションの変更
* 新しい貼り付け形式の追加

## 利用する貼り付け形式の変更 (`options.pasteMenu`)

### デフォルトで利用可能な貼り付け形式

以下の貼り付け形式がデフォルトで利用可能です。オプションを指定できる形式については、オプションの内容も記載しています。

* `text` テキストとして貼り付け
* `html` HTMLとして貼り付け
  * <dl><dt>keepDataAttributes : <code>boolean</code></dt><dd>HTMLのdata-*属性を保持する場合には <code>true</code>を指定します。デフォルトは<code>false</code>で、data-*属性は削除されます。</dd><dt>handler : <code>(doc: Document) => void</code></dt><dd>挿入されるHTMLを変更するための関数を指定します。変更する場合にはDocumentオブジェクトの中ノードを直接書き換えます。</dd></dl>
* `link` リンクとして貼り付け
* `embed` 埋め込みオブジェクト
* `embedInline` インライン埋め込み
* `markdown` Markdownから変換

### エディタのオプションでの指定方法

アイテム名を配列で指定します。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.pasteMenu = [
    'text',
    'markdown',
  ];
});
```

## アイテム毎のオプションの変更 (`options.pasteMenuOptions`)

### エディタのオプションでの指定方法

アイテム名をキーとして、アイテム毎のオプションを指定します。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.pasteMenuOptions = {
    html: {
      keepDataAttributes: true,
      handler(doc) {
        // Remove all styles
        doc.body.querySelectorAll("*").forEach((e) => {
          e.removeAttribute("style");
        });
      },
    },
  };
});
```

`false` を指定するとアイテムを無効化することができます。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.pasteMenuOptions = {
    markdown: false,
  };
});
```

## 新しいアイテムの追加

[PasteMenuItemElement](https://github.com/movabletype/mt-rich-text-editor-internal/blob/main/packages/editor/src/paste-menu/item/element.ts#L15-L95)を拡張したクラスを[カスタム要素](https://developer.mozilla.org/ja/docs/Web/API/Web_components/Using_custom_elements)として登録することで、貼り付け形式として指定できるようになります。

### PasteMenuItemElementの `content` プロパティ

貼り付けが実行された後に、PasteMenuItemElementのインスタンスは `content` プロパティから以下の情報を取得できます。
<dl>
<dt>plainText: <code>string</code></dt>
<dd>貼り付けられた内容のプレーンテキスト</dd>
<dt>htmlDocument: <code>Document | null</code></dt>
<dd>貼り付けられたHTMLを含むDocumentオブジェクト。text/htmlを含んでいなかった場合にはnullになります。</dd>
<dt>targetDomNode: <code>HTMLElement | Text | null</code></dt>
<dd>貼り付け先のDOMノード</dd>
<dt>clipboardData: <code>DataTransfer</code></dt>
<dd>発生したClipboardEventのclipboardData</dd>
<dt>transaction: <code>(cb: () => void | Promise&lt;void&gt;) => void</code></dt>
<dd>エディタの内容を更新する際には、更新操作を行う関数 `cb` を引数に渡します。</dd>
</dl>

### PasteMenuItemElementのメソッド

拡張したクラスでは以下のメソッドを実装します。

<dl>
<dt>isEditorItemAvailable(): <code>boolean</code></dt>
<dd>現在の貼付けデータに対してその貼り付け形式が利用可能かどうかを返します</dd>
<dt>onEditorPaste(): <code>Promise&lg;void&gt;</code></dt>
<dd>貼り付けの操作を実行します</dd>
</dl>

また拡張したクラスでは以下のユーティリティメソッドを利用できます。

<dl>
<dt>insertContent(content): <code>void</code></dt>
<dd>`content` をエディタに挿入します。Tiptapの[insertContent](https://tiptap.dev/docs/editor/api/commands/content/insert-content)コマンドの引数と同じ型を渡すことができます。</dd>
</dl>

以下が簡単な実装例です。`mt-rich-text-editor-paste-menu-item-${itemName}` という名前でカスタム要素を登録することで、`itemName` をアイテム名として貼り付けメニューに指定できるようになります。

```typescript
customElements.define(
  "mt-rich-text-editor-paste-menu-item-myitem",
  class extends PasteMenuItemElement {
    constructor() {
      super();
      const button = document.createElement("button");
      button.textContent = "My Paste Item";
      this.shadowRoot.appendChild(button);
    }

    isEditorItemAvailable() {
      return /^https?:\/\//.test(this.content?.plainText);
    }

    async onEditorPaste() {
      this.insertContent(this.content?.plainText);
    }

    connectedCallback() {
      this.addEventListener('click', () => {
        this.onEditorPaste();
      });
    }
  }
);
```

より実践的な実装例は以下のサンプルプラグインを参照してください。
<ul>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-paste-highlight">MTRichTextEditorPasteHighlight</a></li>
</ul>
