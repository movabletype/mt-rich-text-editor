package MT::Plugin::MTRichTextEditor::Util;

use strict;
use warnings;
use utf8;

use MT::Util;

sub add_toolbar_items {
    shift if $_[0] eq __PACKAGE__;
    my ($options) = @_;

    my $plugin  = MT->component('MTRichTextEditor');
    my $toolbar = MT::Util::from_json($plugin->get_config_value('toolbar'));

    my $side = $options->{side} || 'left';
    if ($side !~ m/^(left|right)$/) {
        die 'side must be "left" or "right"';
    }

    my $row = $options->{row} || 0;
    if ($row !~ m/^-?\d+$/) {
        die 'row must be a number';
    }

    my $column = defined($options->{column}) ? $options->{column} : scalar @{ $toolbar->[$row][$side eq 'left' ? 0 : 1] };
    if ($column !~ m/^-?\d+$/) {
        die 'column must be a number';
    }

    splice @{ $toolbar->[$row][$side eq 'left' ? 0 : 1] }, $column, 0, $options->{items};
    $plugin->set_config_value('toolbar', MT::Util::to_json($toolbar));
}

1;
