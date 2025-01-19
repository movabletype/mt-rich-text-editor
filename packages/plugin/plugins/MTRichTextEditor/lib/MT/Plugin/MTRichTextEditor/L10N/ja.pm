# Movable Type (r) (C) 2006-2019 Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.
#
# $Id$

package MT::Plugin::MTRichTextEditor::L10N::ja;

use strict;
use warnings;
use utf8;

use base 'MT::Plugin::MTRichTextEditor::L10N::en_us';
use vars qw( %Lexicon );

%Lexicon = (
    'MTRichTextEditor'          => 'リッチテキストエディタ',
    'MTRichTextEditor Settings' => 'リッチテキストエディタ設定',
    'Toolbar'                   => 'ツールバー',
    'Blocks'                    => 'フォーマット',
    'Colors'                    => '文字色と背景色の選択肢',
    'Available Items'           => '追加可能なアイテム',
    'Available Blocks'          => '追加可能なブロック',
    'Add New Color'             => '新しい色を追加',

    'Insert (s)'         => '挿入 (s)',
    'Insert'             => '挿入',
    'Cancel (x)'         => 'キャンセル (x)',
    'Cancel'             => 'キャンセル',
    'Title'              => 'タイトル',
    'Source Code'        => 'ソースコード',
    'Insert Link'        => 'リンク挿入',
    'Link URL'           => 'リンクURL',
    'Link Text'          => 'リンク元テキスト',
    'Link Target'        => 'リンクの開き方...',
    'LINK_TARGET_SELF'   => '同じウィンドウ',
    'LINK_TARGET_BLANK'  => '新規ウィンドウ',
    'Insert Boilerplate' => '定型文の挿入',
    'Text'               => 'テキスト',

    'Bold'                        => '太字',
    'Italic'                      => '斜体',
    'Underline'                   => '下線',
    'Strike'                      => '取り消し線',
    'Blockquote'                  => '引用',
    'Bullet List'                 => '箇条書き',
    'Ordered List'                => '番号付き箇条書き',
    'Horizontal Rule'             => '水平罫線',
    'Link'                        => 'リンク',
    'Unlink'                      => 'リンクを解除',
    'Edit Link'                   => 'リンクを編集',
    'Insert HTML'                 => 'HTMLの挿入',
    'Insert File'                 => 'アセットの挿入',
    'Insert Image'                => '画像の挿入',
    'Delete Image'                => '画像を削除',
    'Edit Image'                  => '画像を編集',
    'Table'                       => '表',
    'Toggle to HTML editing mode' => 'HTML編集モードへの切り替え',
    'Insert Boilerplate'          => '定型文の挿入',
    'Undo'                        => '元に戻す',
    'Redo'                        => 'やり直す',
    'Remove Format'               => '書式をクリア',
    'Align Left'                  => '左揃え',
    'Align Center'                => '中央揃え',
    'Align Right'                 => '右揃え',
    'Indent'                      => 'インデントを増やす',
    'Outdent'                     => 'インデントを減らす',
    'Full Screen'                 => 'フルスクリーン',

    'File'                                  => 'ファイル',
    'Image'                                 => '画像',
    'Toggle to HTML structure editing mode' => 'HTML構造編集モードへの切り替え',
    'Boilerplate'                           => '定型文',
    'Text Color'                            => 'テキストの色',
    'Background Color'                      => '背景色',
    'Failed to get embed object'            => '埋め込みオブジェクトの取得に失敗しました',

    'Paste as text'                                                                                          => 'テキストとして貼り付け',
    'Paste as HTML'                                                                                          => 'HTMLとして貼り付け',
    'Paste as link'                                                                                          => 'リンクとして貼り付け',
    'Embed inline'                                                                                           => 'インライン埋め込み',
    'Embed object'                                                                                           => '埋め込みオブジェクト',
    'Data attributes'                                                                                        => 'データ属性',
    'Select the data attributes you want to keep in the pasted HTML. Unselected attributes will be removed.' => '保持したいデータ属性を選択してください。選択しない属性は削除されます。',
    'Select All'                                                                                             => 'すべて選択',
    'Properties for style attributes'                                                                        => 'style属性のプロパティ',
    'Select the properties you want to keep in the pasted HTML. Unselected properties will be removed.'      => 'style属性のプロパティを選択してください。選択しないプロパティは削除されます。',
    'URL'                                                                                                    => 'URL',
    'Width'                                                                                                  => '幅',
    'Height'                                                                                                 => '高さ',

    'Embed webpage as card'        => 'ウェブページの埋め込み (カード)',
    'Embed webpage as inline link' => 'ウェブページの埋め込み (インラインリンク)',
    'Convert from Markdown'        => 'Markdownから変換',

    'Cell'                 => 'セル',
    'Row'                  => '行',
    'Column'               => '列',
    'Insert table'         => '表の挿入',
    'Delete table'         => '表の削除',
    'Merge cells'          => 'セルを結合',
    'Split cell'           => 'セルを分割',
    'Cell properties'      => 'セルのプロパティ',
    'Insert row before'    => '前に行を挿入',
    'Insert row after'     => '後に行を挿入',
    'Row properties'       => '行のプロパティ',
    'Delete row'           => '行の削除',
    'Insert column before' => '前に列を挿入',
    'Insert column after'  => '後に列を挿入',
    'Delete column'        => '列の削除',
    'Table properties'     => '表のプロパティ',

    'Table Properties' => '表のプロパティ',
    'Row Properties'   => '行のプロパティ',
    'Cell Properties'  => 'セルのプロパティ',

    'Cell type'   => 'セルの種類',
    'Cell'        => 'セル',
    'Header cell' => 'ヘッダーセル',

    'Paragraph'    => '段落',
    'Heading 1'    => '見出し 1',
    'Heading 2'    => '見出し 2',
    'Heading 3'    => '見出し 3',
    'Heading 4'    => '見出し 4',
    'Heading 5'    => '見出し 5',
    'Heading 6'    => '見出し 6',
    'Preformatted' => '書式設定済み',

    'Default parameters for embedding by oEmbed' => 'oEmbedによる埋込時のデフォルトのパラメーター',
);

1;
