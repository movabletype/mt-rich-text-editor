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
    'Boilerplate'        => '定型文',
    'Text'               => 'テキスト',

    'Paste As Text'                                                                                          => 'テキストとして貼り付け',
    'Paste As HTML'                                                                                          => 'HTMLとして貼り付け',
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
    'Table Properties'             => 'テーブルのプロパティ',
    'Convert from Markdown'        => 'Markdownから変換',

    'Heading 1' => '見出し 1',
    'Heading 2' => '見出し 2',
    'Heading 3' => '見出し 3',
    'Heading 4' => '見出し 4',
    'Heading 5' => '見出し 5',
    'Heading 6' => '見出し 6',
);

1;
