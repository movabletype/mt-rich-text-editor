use strict;
use warnings;

use FindBin;
use lib "$FindBin::Bin/../../../t/lib";

use Test::More;
use MT::Test::Env;

our $mfa_valid_token;
our $mfa_invalid_token;
our $test_env;
BEGIN {
    $test_env = MT::Test::Env->new;
    $ENV{MT_CONFIG} = $test_env->config_file;
}

use MT::Test;
use MT::Test::Permission;
use MT::Test::App;

$test_env->prepare_fixture('db');
my $plugin = MT->component('MTRichTextEditor');

subtest 'add_toolbar_items' => sub {
    subtest 'add to first row' => sub {
        $plugin->reset_config;

        my $new_items = ['test-button'];

        MT::Plugin::MTRichTextEditor::Util->add_toolbar_items({
            items => $new_items,
            row   => 0,
        });

        my $toolbar = MT::Util::from_json($plugin->get_config_value('toolbar'));
        is_deeply $toolbar->[0][0][-1], $new_items;
    };

    subtest 'add to last row' => sub {
        $plugin->reset_config;

        my $new_items = ['test-button'];

        MT::Plugin::MTRichTextEditor::Util->add_toolbar_items({
            items => $new_items,
            row   => -1,
        });

        my $toolbar = MT::Util::from_json($plugin->get_config_value('toolbar'));
        is_deeply $toolbar->[-1][0][-1], $new_items;
    };

    subtest 'add to left side of first row' => sub {
        $plugin->reset_config;

        my $new_items = ['test-button'];

        MT::Plugin::MTRichTextEditor::Util->add_toolbar_items({
            items => $new_items,
            row   => 0,
            side  => 'left',
        });

        my $toolbar = MT::Util::from_json($plugin->get_config_value('toolbar'));
        is_deeply $toolbar->[0][0][-1], $new_items;
    };

    subtest 'add to right side of first row' => sub {
        $plugin->reset_config;

        my $new_items = ['test-button'];

        MT::Plugin::MTRichTextEditor::Util->add_toolbar_items({
            items => $new_items,
            row   => 0,
            side  => 'right',
        });

        my $toolbar = MT::Util::from_json($plugin->get_config_value('toolbar'));
        is_deeply $toolbar->[0][1][-1], $new_items;
    };

    subtest 'unshift to first row' => sub {
        $plugin->reset_config;

        my $new_items = ['test-button'];

        MT::Plugin::MTRichTextEditor::Util->add_toolbar_items({
            items  => $new_items,
            row    => 0,
            column => 0,
        });

        my $toolbar = MT::Util::from_json($plugin->get_config_value('toolbar'));
        is_deeply $toolbar->[0][0][0], $new_items;
    };
};

done_testing();
