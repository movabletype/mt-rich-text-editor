use strict;
use warnings;

use FindBin;
use lib "$FindBin::Bin/../../../t/lib";

use Test::More;
use Test::MockModule;
use MT::Test::Env;

our $mfa_valid_token;
our $mfa_invalid_token;
our $test_env;
BEGIN {
    $test_env = MT::Test::Env->new(
        PluginPath => ['TEST_ROOT/plugins'],
    );
    $ENV{MT_CONFIG} = $test_env->config_file;

    $test_env->save_file('plugins/MTRichTextEditor-Embed-Test/config.yaml', <<'YAML' );
name: MTRichTextEditor-Embed-Test
key: MTRichTextEditor-Embed-Test
id: MTRichTextEditor-Embed-Test

callbacks:
  mt_rich_text_editor_embed_url: |
    sub {
        my ($cb, $params) = @_;

        if ($params->{url} =~ m/skipped-by-filter/) {
            return 0;
        }
        elsif ($params->{url} =~ m/replaced-with-blank/) {
            $params->{url} = '';
        }
        elsif ($params->{url} =~ m/replaced-with-mt-jp/) {
            $params->{url} = 'https://movabletype.jp/path/to/page.html';
        }

        1;
    }
YAML
}

use MT::Test;
use MT::Test::Permission;
use MT::Test::App;

$test_env->prepare_fixture('db');

my $plugin = MT->component('MTRichTextEditor');
my $admin  = MT::Author->load(1);
my $guest  = MT::Test::Permission->make_author;
my $site   = MT::Test::Permission->make_website;
my $app    = MT::Test::App->new('MT::App::CMS');
$app->login($admin);

my $mock      = Test::MockModule->new(ref(MT->new_ua));
my $site_page = $site->site_url . 'path/to/page.html';
(my $site_page_with_port      = $site->site_url . 'path/to/page.html') =~ s{/path}{:80};
(my $site_page_mismatch_proto = $site->site_url . 'path/to/page.html') =~ s{http://}{https://};
my %response_map = (
    $site_page                                 => HTTP::Response->new(200, 'OK',        ['Content-Type' => 'text/html'], '<html><title>test site</title></html>'),
    $site_page_with_port                       => HTTP::Response->new(200, 'OK',        ['Content-Type' => 'text/html'], '<html><title>test site</title></html>'),
    'https://movabletype.jp/path/to/page.html' => HTTP::Response->new(200, 'OK',        ['Content-Type' => 'text/html'], '<html><title>test site</title></html>'),
    'http://movabletype.jp/not-found.html'     => HTTP::Response->new(404, 'Not Found', ['Content-Type' => 'text/html'], '<html><title>test site</title></html>'),
    'http://movabletype.jp/invalid.html'       => HTTP::Response->new(200, 'OK',        ['Content-Type' => 'text/html'], '<html><title>test</html></html>'),
);
my @request_urls = ();
$mock->mock(
    'get',
    sub {
        my ($self, $url) = @_;
        push @request_urls, $url;
        $response_map{$url} || HTTP::Response->new(404, 'Not Found');
    });

subtest 'invalid request' => sub {
    subtest 'guest user is not allowed' => sub {
        $app->login($guest);

        @request_urls = ();
        $app->get({
            __mode    => 'mt_rich_text_editor_embed',
            url       => $site_page,
            maxwidth  => 500,
            maxheight => 500,
            blog_id   => $site->id,
        });
        is_deeply \@request_urls, [];
    };

    $app->login($admin);
    subtest 'blank URL value is not allowed' => sub {
        @request_urls = ();
        $app->get({
            __mode    => 'mt_rich_text_editor_embed',
            url       => '',
            maxwidth  => 500,
            maxheight => 500,
            blog_id   => $site->id,
        });
        $app->status_is(400);
        is_deeply \@request_urls, [];
        my $res = $app->json;
        ok $res->{error}{message};
    };
};

subtest 'retrieve web page metadata' => sub {
    no warnings 'once';

    subtest 'embed_site_rule: EMBED_ALLOW_SITE' => sub {
        $plugin->set_config_value('embed_site_rule', $MT::Plugin::MTRichTextEditor::EMBED_ALLOW_SITE);

        subtest 'can retrieve a site' => sub {
            @request_urls = ();
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $site_page,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [$site_page];
            my $res = $app->json;
            ok !$res->{error};
            ok $res->{inline};
            ok $res->{html};
        };

        subtest 'can retrieve a site with explicitly defined port' => sub {
            @request_urls = ();
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $site_page_with_port,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [$site_page_with_port];
            my $res = $app->json;
            ok !$res->{error};
            ok $res->{inline};
            ok $res->{html};
        };

        subtest 'can not retrieve a site with mismatched protocol' => sub {
            @request_urls = ();
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $site_page_mismatch_proto,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [];
            my $res = $app->json;
            ok !$res->{error};
            ok !$res->{inline};
            ok !$res->{html};
        };

        subtest 'can not retrieve arbitrary site' => sub {
            @request_urls = ();
            my $url = 'https://movabletype.jp/path/to/page.html';
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $url,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [];
            my $res = $app->json;
            ok !$res->{error};
            ok !$res->{inline};
            ok !$res->{html};
        };
    };

    subtest 'embed_site_rule: EMBED_ALLOW_ALL' => sub {
        $plugin->set_config_value('embed_site_rule', $MT::Plugin::MTRichTextEditor::EMBED_ALLOW_ALL);

        subtest 'can retrieve a site' => sub {
            @request_urls = ();
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $site_page,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [$site_page];
            my $res = $app->json;
            ok !$res->{error};
            ok $res->{inline};
            ok $res->{html};
        };

        subtest 'can not retrieve arbitrary site' => sub {
            @request_urls = ();
            my $url = 'https://movabletype.jp/path/to/page.html';
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $url,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [$url];
            my $res = $app->json;
            ok !$res->{error};
            ok $res->{inline};
            ok $res->{html};
        };
    };

    subtest 'embed_site_rule: EMBED_DENY_ALL' => sub {
        $plugin->set_config_value('embed_site_rule', $MT::Plugin::MTRichTextEditor::EMBED_DENY_ALL);

        subtest 'can not retrieve a site' => sub {
            @request_urls = ();
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $site_page,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [];
            my $res = $app->json;
            ok !$res->{error};
            ok !$res->{inline};
            ok !$res->{html};
        };

        subtest 'can not retrieve arbitrary site' => sub {
            @request_urls = ();
            my $url = 'https://movabletype.jp/path/to/page.html';
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $url,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [];
            my $res = $app->json;
            ok !$res->{error};
            ok !$res->{inline};
            ok !$res->{html};
        };
    };

    $plugin->set_config_value('embed_site_rule', $MT::Plugin::MTRichTextEditor::EMBED_ALLOW_ALL);

    subtest 'An error occurred while retrieving the site' => sub {
        subtest 'Not Found' => sub {
            @request_urls = ();
            my $url = 'http://movabletype.jp/not-found.html';
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $url,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [$url];
            my $res = $app->json;
            ok $res->{error}{message};
        };

        subtest 'Invalid content' => sub {
            my $mock_parser = Test::MockModule->new('MT::Plugin::MTRichTextEditor::HeadParser');
            $mock_parser->mock(
                'parse',
                sub {
                    die;
                });
            @request_urls = ();
            my $url = 'http://movabletype.jp/invalid.html';
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $url,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [$url];
            my $res = $app->json;
            ok $res->{error}{message};

            $mock_parser->unmock_all;
        };
    };

    subtest 'mt_rich_text_editor_embed_url callback' => sub {
        subtest 'skipped by filter' => sub {
            @request_urls = ();
            my $url = 'https://skipped-by-filter.com';
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $url,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [];
            my $res = $app->json;
            ok !$res->{error};
            ok !$res->{inline};
            ok !$res->{html};
        };

        subtest 'replaced with blank' => sub {
            @request_urls = ();
            my $url = 'https://replaced-with-blank.com';
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => $url,
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, [];
            my $res = $app->json;
            ok !$res->{error};
            ok !$res->{inline};
            ok !$res->{html};
        };

        subtest 'replaced with movabletype.jp' => sub {
            @request_urls = ();
            $app->get_ok({
                __mode    => 'mt_rich_text_editor_embed',
                url       => 'https://replaced-with-mt-jp.com',
                maxwidth  => 500,
                maxheight => 500,
                blog_id   => $site->id,
            });
            is_deeply \@request_urls, ['https://movabletype.jp/path/to/page.html'];
            my $res = $app->json;
            ok !$res->{error};
            ok $res->{inline};
            ok $res->{html};
        };
    };
};

done_testing();
