# ウェブページの埋め込み機能のカスタマイズ

> [!NOTE]
> このページで説明するのはエディタ本体ではなく、Movable Typeのプラグインによってサーバー側でカスタマイズを行う方法です。

## 埋め込むデータを取得するURLの制御

データを取得するURLの基本的な許可設定は管理画面のリッチテキストエディタの設定でも行えますが、プラグインを使うとより細かく制御できます。

MTRichTextEditorのプラグインでは埋め込むデータを取得する前に `mt_rich_text_editor_embed_url` のコールバックが呼び出されます。コールバックから偽の値を返すと埋め込みをキャンセルできます。また、`$params->{url}` の値を書き換えることで、取得するURLを変更することもできます。

```perl
sub my_mt_rich_text_editor_embed_url_callback {
    my ($cb, $params) = @_;

    # deny specific hosts
    if ($params->{url} =~ m{https://denied-host-1.example.com}) {
        return 0;
    }
    # another way to deny specific hosts
    elsif ($params->{url} =~ m{https://denied-host-2.example.com}) {
        $params->{url} = '';
    }

    # replace production URL with local staging environment URL for retrieving oEmbed data
    $params->{url} =~ s{https://production.example.com.jp}{http://localhost};

    1;
}
```

プラグインとしての完全な実装例は以下のサンプルプラグインを参照してください。
<ul>
<li><a href="https://github.com/movabletype/mt-rich-text-editor-example-plugins/tree/main/packages/mt-plugin-mt-rich-text-editor-embed-url-filter">MTRichTextEditorEmbedUrlFilter</a></li>
</ul>
