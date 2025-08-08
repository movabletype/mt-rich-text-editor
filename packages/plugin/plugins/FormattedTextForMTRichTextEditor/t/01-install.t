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
use MT::Test::Upgrade;

$test_env->prepare_fixture('db');

subtest 'install "Insert Boilerplate" button' => sub {
    MT::Test::Upgrade->upgrade(
        from => 1.0000,
        component => 'formattedtextformtrichtexteditor'
    );

    my $rich_editor = MT->component('MTRichTextEditor');
    my $toolbar = MT::Util::from_json($rich_editor->get_config_value('toolbar'));
    is_deeply $toolbar->[0][0][-1], ['boilerplate'];
};

done_testing();
