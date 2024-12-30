package MT::Plugin::MTRichTextEditor::Util;

use strict;
use warnings;
use utf8;

use MT::Util;

sub install_toolbar_items {
    shift if $_[0] eq __PACKAGE__;
    my ($items, $row, $col) = @_;
    my $plugin  = MT->component('MTRichTextEditor');
    my $toolbar = MT::Util::from_json($plugin->get_config_value('toolbar'));
    splice @{ $toolbar->[$row] }, $col, 0, $items;
    $plugin->set_config_value('toolbar', MT::Util::to_json($toolbar));
}

1;
