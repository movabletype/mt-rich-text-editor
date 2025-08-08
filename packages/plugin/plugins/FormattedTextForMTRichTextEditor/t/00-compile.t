use strict;
use warnings;

use FindBin;
use Test::More;

use lib qw(lib extlib plugins/FormattedText/lib), "$FindBin::Bin/../lib";

use_ok 'FormattedTextForMTRichTextEditor::App';
use_ok 'FormattedTextForMTRichTextEditor::L10N';
use_ok 'FormattedTextForMTRichTextEditor::L10N::ja';
use_ok 'FormattedTextForMTRichTextEditor::L10N::en_us';

done_testing;
