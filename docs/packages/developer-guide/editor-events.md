---
description: エディタのイベントを利用して、エディタの生成や内容の入出力に処理を差し込む方法について説明します。
---

# エディタのイベント

ここでは、エディタのイベントを利用して、エディタの生成や内容の入出力に処理を差し込む方法について説明します。

## MTRichTextEditorのイベント

`MTRichTextEditor.on(name, handler)` でハンドラを登録します。

<dl>
<dt>create : <code>(options: EditorCreateOptions) =&gt; void</code></dt>
<dd>エディタが生成される直前に、初期化オプションを引数として呼び出されます。オプションを書き換えることでエディタの設定を変更できます。詳細は<a href="editor-options">エディタの初期化オプション</a>を参照してください。</dd>
<dt>init : <code>(editor: Editor) =&gt; void</code></dt>
<dd>エディタが生成された直後に、生成された <code>Editor</code> インスタンスを引数として呼び出されます。後述のEditorインスタンスのイベントを登録する場合などに利用します。</dd>
</dl>

```typescript
MTRichTextEditor.on("init", (editor) => {
  // ここでeditorに対する処理を登録する
});
```

## Editorインスタンスのイベント

`editor.on(name, handler)` でハンドラを登録します。ハンドラにはイベント毎のデータを持つオブジェクトが渡されます。

<dl>
<dt>beforeGetContent : <code>{}</code></dt>
<dd>エディタの内容からHTMLが生成される直前に呼び出されます。</dd>
<dt>getContent : <code>{ content: string }</code></dt>
<dd>エディタの内容からHTMLが生成された直後に呼び出されます。ハンドラで <code>content</code> を書き換えると、書き換えた内容が <code>getContent()</code> の戻り値（保存される内容）になります。</dd>
<dt>setContent : <code>{ source: string; content: string }</code></dt>
<dd>エディタに内容が設定される直前に呼び出されます。<code>source</code> には設定元を表す文字列（外部からの設定の場合は <code>"external"</code>、HTML編集モードからの反映の場合は <code>"sourceEditor"</code> など）が入ります。ハンドラで <code>content</code> を書き換えると、書き換えた内容がエディタに設定されます。</dd>
</dl>

以下は、保存されるHTMLから特定の属性を取り除く例です。

```typescript
MTRichTextEditor.on("init", (editor) => {
  editor.on("getContent", (data) => {
    data.content = data.content.replace(/\sdata-draft-note="[^"]*"/g, "");
  });
});
```
