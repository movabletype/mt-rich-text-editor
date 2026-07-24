---
description: 初期化オプションの指定方法と、利用可能なオプションについて説明します。
---

# エディタの初期化オプション

以下のようなプラグインでエディタの初期化オプションを上書きすることができます。

```mtml
<mt:setvarblock name="js_include" append="1">
  <script type="module">
    /**
     * The "create" event is triggered before the rich text editor is created.
     */
    MTRichTextEditor.on("create", (options) => {
      // override options here
    })
  </script>
</mt:setvarblock>
```

## オプション一覧

以下のオプションが指定可能です。（プラグインから通常利用しないオプションは除外しています）

<dl>
<dt>height : <code>number | string</code></dt>
<dd>高さを指定します。数値を指定した場合はpxとして解釈されます。CSSのheightプロパティに指定する値として文字列で指定することも可能です。</dd>
<dt>classNames : <code>string[]</code></dt>
<dd>編集領域の要素に指定するクラス名を指定します。</dd>
<dt>stylesheets : <code>string[]</code></dt>
<dd>編集領域に挿入するスタイルシートを指定します。httpから始まる文字列の場合にはURLとして、そうでない場合にtext/cssの内容として解釈されます。</dd>
<dt>extensions : <code>TiptapExtension[]</code></dt>
<dd>
Tiptapの<a href="https://tiptap.dev/docs/editor/core-concepts/extensions">Extension</a>を直接エディタに組み込む場合に指定します。<br>
具体的な利用方法は以下のサンプルプラグインを参照してください。
<ul>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-extension-emoji">MTRichTextEditorExtensionEmoji</a></li>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-extension-font-size">MTRichTextEditorExtensionFontSize</a></li>
</ul>
</dd>
<dt>extensionOptions : <code>Record&lt;string, unknown&gt;</code></dt>
<dd>エディタに組み込まれているTiptapのExtensionのオプションを指定します。詳細はこのページの下部にある<a href="#extension-options">extensionOptionsの利用例</a>を参照してください。</dd>
<dt>toolbar : <code>string[][][][]</code></dt>
<dd>ツールバーに表示するボタンの定義を指定します。詳細は<a href="toolbar-item-element">ツールバーのカスタマイズ</a>を参照してください。</dd>
<dt>toolbarOptions : <code>Record&lt;string, unknown&gt;</code></dt>
<dd>ツールバーのオプションを指定します。詳細は<a href="toolbar-item-element">ツールバーのカスタマイズ</a>を参照してください。</dd>
<dt>statusbar : <code>string[][]</code></dt>
<dd>ステータスバーの定義を指定します。詳細は<a href="statusbar-item-element">ステータスバーのカスタマイズ</a>を参照してください。</dd>
<dt>statusbarOptions : <code>Record&lt;string, unknown&gt;</code></dt>
<dd>ステータスバーのオプションを指定します。詳細は<a href="statusbar-item-element">ステータスバーのカスタマイズ</a>を参照してください。</dd>
<dt>pasteMenu : <code>string[]</code></dt>
<dd>貼り付けメニューに表示する項目を指定します。詳細は<a href="paste-menu-item-element">貼り付け形式の追加</a>を参照してください。</dd>
<dt>pasteMenuOptions : <code>PasteMenuOptions</code></dt>
<dd>貼り付けメニューのオプションを指定します。詳細は<a href="paste-menu-item-element">貼り付け形式の追加</a>を参照してください。</dd>
<dt>quickAction : <code>string[]</code></dt>
<dd>クイックアクションに表示する項目を指定します。詳細は<a href="quick-action-item-element">クイックアクションのカスタマイズ</a>を参照してください。</dd>
<dt>quickActionOptions : <code>QuickActionOptions</code></dt>
<dd>クイックアクションのオプションを指定します。詳細は<a href="quick-action-item-element">クイックアクションのカスタマイズ</a>を参照してください。</dd>
<dt>htmlOutputOptions : <code>HtmlOutputOptions</code></dt>
<dd>HTML出力のオプションを指定します。<code>HtmlOutputOptions</code>のインターフェイスの定義は以下の通りです。
<dl>
<dt>format : <code>boolean</code></dt>
<dd>HTMLをフォーマットするかどうかを指定します。デフォルトは <code>true</code> です。</dd>
<dt>indentSize : <code>number</code></dt>
<dd>インデントのサイズを指定します。デフォルトは <code>0</code> （インデントしない）です。</dd>
<dt>contentUnformatted : <code>string[]</code></dt>
<dd>フォーマットしないタグのリストを指定します。デフォルトは <code>['pre', 'style', 'script']</code> です。</dd>
</dl>
</dd>
<dt>additionalBlockElements : <code>string[]</code></dt>
<dd>ブロック要素（div相当）として扱う要素名を追加します（例: <code>["abbr", "address"]</code>）。デフォルトでインライン要素として扱われる要素（例: <code>button</code>）を指定した場合には、ブロック要素としての扱いに変更されます。</dd>
<dt>additionalInlineElements : <code>string[]</code></dt>
<dd>インライン要素（span相当）として扱う要素名を追加します（例: <code>["time", "var"]</code>）。デフォルトでブロック要素として扱われる要素を指定した場合には、インライン要素としての扱いに変更されます。</dd>
</dl>

## extensionOptionsの利用例<a id="extension-options"></a>

MTRichTextEditorでは、以下のようにTiptapのExtensionを組み込んでいます。

https://github.com/movabletype/mt-rich-text-editor/blob/develop/packages/editor/src/tiptap/extension.ts

extensionOptionsを利用することで、これらのExtensionのオプションを指定することができます。例えば[HardBreak](https://tiptap.dev/docs/editor/extensions/nodes/hard-break)のオプションを指定する場合は以下のように指定します。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.extensionOptions = {
    ...(options.extensionOptions || {}),
    hardBreak: {
      HTMLAttributes: {
        class: 'my-hard-break',
      },
    },
  };
})
```

特定のExtensionを無効にする場合は、以下のように `false` を指定します。

```typescript
MTRichTextEditor.on("create", (options) => {
  options.extensionOptions = {
    ...(options.extensionOptions || {}),
    hardBreak: false,
  };
})
```

<!--
独自のExtensionは内部のプラグイン向けの性格が強く、頻繁に変更される可能性があり、現時点では利用は推奨しないので、コメントアウトしています

### MTRichTextEditor独自のExtensionのオプション

MTRichTextEditor独自のExtensionのうち、以下のものはMovable Typeが提供する処理をプラグインで差し替えることができます。

<dl>
<dt>embedObject.resolver : <code>(data: { url: string; maxwidth?: number; maxheight?: number }) =&gt; Promise&lt;{ html: string }&gt;</code></dt>
<dd>URLから埋め込みデータ（oEmbed）を解決する処理を指定します。通常はMovable Typeの管理画面を経由して解決する処理が設定されています。サーバー側で取得URLを制御する方法については<a href="embed-url">ウェブページの埋め込み機能のカスタマイズ</a>を参照してください。</dd>
<dt>markdown.toHtml : <code>(data: { content: string }) =&gt; Promise&lt;{ content: string }&gt;</code></dt>
<dd>貼り付けメニューの「Markdownから変換」で利用されるMarkdownからHTMLへの変換処理を指定します。通常はMovable Typeのテキストフォーマットを利用した変換処理が設定されています（Markdownのテキストフォーマットが利用できない環境では未設定となり、メニューには表示されません）。</dd>
</dl>
-->

## ソースコード

より具体的には以下のコードの `EditorOptions` インターフェイスを参照してください。

https://github.com/movabletype/mt-rich-text-editor/blob/main/packages/editor/src/editor.ts
