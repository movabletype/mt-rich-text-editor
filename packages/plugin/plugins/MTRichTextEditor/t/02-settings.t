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
my $admin  = MT::Author->load(1);
my $guest  = MT::Test::Permission->make_author;
my $app    = MT::Test::App->new('MT::App::CMS');

subtest 'settings' => sub {
    $app->login($admin);

    subtest 'can open settings screen as admin' => sub {
        $app->get_ok({
            __mode => 'mt_rich_text_editor_settings',
        });
        is $app->wq_find('form[name="mt_rich_text_editor_settings_form"]')->size, 1;
    };

    subtest 'can not open settings screen with blog_id' => sub {
        $app->get_ok({
            __mode  => 'mt_rich_text_editor_settings',
            blog_id => 1,
        });
        ok $app->last_location;
    };

    $app->login($guest);

    subtest 'can not open settings screen as guest' => sub {
        $app->get_ok({
            __mode => 'mt_rich_text_editor_settings',
        });
        is $app->wq_find('form[name="mt_rich_text_editor_settings_form"]')->size, 0;
        is $app->wq_find('div#permissions.alert')->size,                          1;
    };
};

subtest 'save_settings' => sub {
    $app->login($admin);

    my %default_params = map { ("mt_rich_text_editor_$_" => $plugin->get_config_value($_)) } qw(toolbar blocks colors embed_default_params);

    subtest 'can save settings as admin' => sub {
        my $new_embed_default_params = '{"maxwidth":1200,"maxheight":1200}';
        $app->post_ok({
            __mode => 'mt_rich_text_editor_save_settings',
            %default_params,
            mt_rich_text_editor_embed_default_params => $new_embed_default_params,
        });
        is $plugin->get_config_value('embed_default_params'), $new_embed_default_params;
    };

    $app->login($guest);

    subtest 'can not save settings as guest' => sub {
        my $new_embed_default_params = '{"maxwidth":1500,"maxheight":1500}';
        $app->post_ok({
            __mode => 'mt_rich_text_editor_save_settings',
            %default_params,
            mt_rich_text_editor_embed_default_params => $new_embed_default_params,
        });
        isnt $plugin->get_config_value('embed_default_params'), $new_embed_default_params;
    };
};

done_testing();
