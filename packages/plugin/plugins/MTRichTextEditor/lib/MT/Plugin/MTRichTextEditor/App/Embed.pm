# Movable Type (r) (C) 2006-2020 Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.

package MT::Plugin::MTRichTextEditor::App::Embed;

use strict;
use warnings;
use utf8;

use MT::Util;
use MT::Plugin::MTRichTextEditor qw(plugin translate);
use MT::Plugin::MTRichTextEditor::HeadParser;

sub get_oembed_url {
    my ($url) = @_;

    # hatena
    return "https://hatenablog.com/oembed?url=${url}"
        if $url =~ m/\.(?:
    hatenablog\.com |
    hatenablog\.jp |
    hateblo\.jp |
    hatenadiary\.jp |
    hatenadiary\.com
    )/ix;

    # youtube
    return "https://www.youtube.com/oembed?url=${url}"
        if $url =~ /youtube|youtu\.be/i;

    # soundcloud
    return "https://soundcloud.com/oembed?url=${url}"
        if $url =~ /soundcloud/i;

    # mixcloud
    return "https://www.mixcloud.com/oembed/?url=${url}"
        if $url =~ /mixcloud/i;

    # vimeo
    return "https://vimeo.com/api/oembed.json?url=${url}"
        if $url =~ /vimeo/i;

    # slideshare
    return "https://www.slideshare.net/api/oembed/2?url=${url}"
        if $url =~ /slideshare/i;

    # twitter
    return "https://publish.twitter.com/oembed?url=${url}"
        if $url =~ /twitter/i;

    # tiktok
    return "https://www.tiktok.com/oembed?url=${url}"
        if $url =~ /tiktok\.com\/.*\/video\/.*/i;

    return "";
}

sub response {
    my ($app, $json, $status) = @_;

    $app->response_code($status)
        if defined $status;
    $app->send_http_header("application/json; charset=utf-8");
    $app->print_encode($json);
    $app->{no_print_body} = 1;
}

sub error {
    my ($app, $msg, $status) = @_;
    response($app, MT::Util::to_json({ error => { message => $msg, }, }), $status);
}

sub resolve {
    my ($app) = @_;
    my $blog = $app->blog;
    return error($app, translate('Invalid request.'), 400) unless $blog && $app->can_do('create_post');

    my $url       = $app->param('url');
    my $maxwidth  = $app->param('maxwidth');
    my $maxheight = $app->param('maxheight');

    return error($app, translate('Invalid request.'), 400) unless $url;

    if (my $oembed_url = get_oembed_url($url)) {
        my $ua  = MT->new_ua;
        my $res = $ua->get($oembed_url . "&format=json" . ($maxwidth ? "&maxwidth=${maxwidth}" : "") . ($maxheight ? "&maxheight=${maxheight}" : ""));

        if ($res->code >= 500) {
            MT->log({
                message  => translate('Can not get oEmbed data from [_1]: [_2]', $oembed_url, $res->decoded_content),
                class    => 'system',
                category => 'MTRichTextEditor',
                level    => MT::Log::ERROR(),
            });
            return error($app, translate('Can not get oEmbed data from [_1]: [_2]', $oembed_url, translate('An error occurred.')), 500);
        }

        return error($app, translate('Can not get oEmbed data from [_1]: [_2]', $oembed_url, $res->decoded_content), 500)
            unless $res->is_success;

        response($app, Encode::decode('UTF-8', $res->content));
    } else {
        my $ua  = MT->new_ua;
        my $res = $ua->get($url);

        return error($app, translate("Can not get site data from URL: ${url}"), 500) unless $res->is_success;

        my $parser = MT::Plugin::MTRichTextEditor::HeadParser->new;
        eval { $parser->parse($res->decoded_content) };
        return error($app, translate("Failed to parse HTML: ${url}"), 500) if $@;

        my $hash  = $parser->hash;
        my $param = {
            icon            => $hash->{icon}             || '',
            og_type         => $hash->{"og:type"}        || '',
            og_locale       => $hash->{"og:locale"}      || '',
            og_title        => $hash->{"og:title"}       || $hash->{"title"}       || '',
            og_description  => $hash->{"og:description"} || $hash->{"description"} || '',
            og_image        => $hash->{"og:image"}       || '',
            og_image_width  => ($hash->{"og:image:width"}  ? int($hash->{"og:image:width"})  : undef),
            og_image_height => ($hash->{"og:image:height"} ? int($hash->{"og:image:height"}) : undef),
            og_url          => $hash->{"og:url"} || $hash->{"canonical"} || '',
            og_site_name    => $hash->{"og:site_name"} || '',
            html            => qq{<a href="${url}">} . $hash->{"title"} . qq{</a>},
        };

        my $uri;
        for my $key (qw(icon og_image)) {
            if ($param->{$key} =~ m{^/}) {
                $uri ||= new URI($url);
                $uri->path($param->{$key});
                $param->{$key} = $uri->as_string;
            }
        }

        my $tmpl = MT->model('template')->load({
            blog_id => $blog->id,
            type    => 'mt_rich_text_editor_embed',
        });
        $tmpl = plugin()->load_tmpl('mt_rich_text_editor_embed.tmpl') unless $tmpl && $tmpl->text ne '';
        my $html = $tmpl->output($param);
        response(
            $app,
            MT::Util::to_json({
                html => $html,
            }));
    }
}

1;
