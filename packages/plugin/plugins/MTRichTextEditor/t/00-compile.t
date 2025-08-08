use strict;
use warnings;

use FindBin;
use Test::More;

use lib qw(lib extlib), "$FindBin::Bin/../lib";

use_ok 'MT::Plugin::MTRichTextEditor';
use_ok 'MT::Plugin::MTRichTextEditor::HeadParser';
use_ok 'MT::Plugin::MTRichTextEditor::App::Embed';
use_ok 'MT::Plugin::MTRichTextEditor::L10N';
use_ok 'MT::Plugin::MTRichTextEditor::L10N::ja';
use_ok 'MT::Plugin::MTRichTextEditor::L10N::en_us';
use_ok 'MT::Plugin::MTRichTextEditor::Util';

done_testing;
