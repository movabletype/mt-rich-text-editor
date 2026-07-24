---
description: 基本的なプラグインの作成方法について説明します。
---

# エディタを拡張するプラグインの作成の基本

エディタをプラグインで拡張する場合の基本的な方法は、config.yamlで以下のように `mt_rich_text_editor` の `extension` にテンプレートを指定するというものです。

```yaml
editors:
  mt_rich_text_editor:
    extension: extension.tmpl
```

このように指定すると、プラグインディレクトリ以下の `tmpl/extension.tmpl` がエディタ本体のテンプレートの直後に読み込まれます。このファイルは管理画面のテンプレートとして読み込まれるので任意のMTタグやHTMLを書くことができます。 `js_include` に `append` するやり方でJavaScriptのコードを記述するのが一般的です。

例えば以下のように記述することで、ブログIDが1のときにツールバーの設定を上書きすることができます。

```mtml
<mt:setvarblock name="js_include" append="1">
  <script type="module">
    const blogId = parseInt("<$mt:BlogID encode_js="1"$>");

    if (blogId === 1) {
      // Override the toolbar setting for blog ID 1

      /**
       * The "create" event is triggered before the rich text editor is created.
       */
      MTRichTextEditor.on("create", (options) => {
        // Toolbar Settings
        options.toolbar = [
          // rows
          [
            // left side
            [
              // groups
              ["block"],
              ["bold", "italic", "underline", "strike"],
              ["link", "unlink"],
            ],
            // right side
            [
              // groups
              ["undo", "redo"],
            ],
          ],
        ];
      })
    }
  </script>
</mt:setvarblock>
```

## 追加したツールバーアイテムの登録

プラグインで[新しいツールバーアイテムを追加](toolbar-item-element#新しいアイテムの追加)した場合、config.yamlの `toolbar_items` にアイテム名を指定すると、管理画面の「リッチテキストエディタの設定」の利用可能なアイテムの一覧にそのアイテムが表示されるようになります。

```yaml
editors:
  mt_rich_text_editor:
    extension: extension.tmpl
    toolbar_items:
      - myitem
```

また、`MT::Plugin::MTRichTextEditor::Util` の `add_toolbar_items` を利用すると、保存されているツールバーの設定にアイテムを追加することができます。プラグインのインストール時（アップグレード時）のコールバックから呼び出すことで、インストールと同時にツールバーへボタンを追加できます。

```perl
MT::Plugin::MTRichTextEditor::Util->add_toolbar_items({
    items  => ['myitem'],  # 追加するアイテム名の配列（1つのグループとして挿入されます）
    row    => 0,           # 挿入先の行
    side   => 'left',      # 'left' または 'right'（省略時は 'left'）
    column => undef,       # グループの挿入位置（省略時は末尾）
});
```

同梱プラグインの[FormattedTextForMTRichTextEditor](https://github.com/movabletype/mt-rich-text-editor/tree/develop/packages/plugin/plugins/FormattedTextForMTRichTextEditor)のconfig.yamlが実装例として参考になります。
