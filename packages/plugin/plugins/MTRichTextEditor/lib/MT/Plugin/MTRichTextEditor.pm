package MT::Plugin::MTRichTextEditor;

use strict;
use warnings;
use utf8;

use MT::Util;

our @EXPORT_OK = qw(plugin translate);
use base qw(Exporter);

my @settings = qw(toolbar blocks colors);

sub component {
    __PACKAGE__ =~ m/::([^:]+)\z/;
}

sub translate {
    MT->component(component())->translate(@_);
}

sub plugin {
    MT->component(component());
}

sub settings {
    my ($app) = @_;
    my $plugin = plugin();
    $app->add_breadcrumb(
        $plugin->translate('MTRichTextEditor Settings'),
        $app->uri(
            'mode' => 'mt_rich_text_editor_settings',
        ),
    );

    my $toolbar_items = [map { @$_ } @{ $app->registry('editors', 'mt_rich_text_editor', 'toolbar_items') }];
    my $param         = {
        saved                                       => $app->param('saved') ? 1 : 0,
        mt_rich_text_editor_toolbar_available_items => MT::Util::to_json($toolbar_items),
        mt_rich_text_editor_block_available_blocks  => MT::Util::to_json([
            { value => 'paragraph', label => '本文' },
            { value => 'h1',        label => '見出し1' },
            { value => 'h2',        label => '見出し2' },
            { value => 'h3',        label => '見出し3' },
            { value => 'h4',        label => '見出し4' },
            { value => 'h5',        label => '見出し5' },
            { value => 'h6',        label => '見出し6' },
            { value => 'pre',       label => '整形済みテキスト' },
        ]),
        map { "mt_rich_text_editor_" . $_ => $plugin->get_config_value($_) } @settings
    };

    $app->setup_editor_param($param);

    $plugin->load_tmpl(
        'mt_rich_text_editor_settings.tmpl',
        $param,
    );
}

sub save_settings {
    my ($app) = @_;

    my $plugin = plugin();
    for my $key (@settings) {
        $plugin->set_config_value($key, scalar $app->param("mt_rich_text_editor_$key"));
    }

    $app->redirect($app->uri(
        mode => 'mt_rich_text_editor_settings',
        args => {
            saved => 1,
        }));
}

sub template_source_mt_rich_text_editor {
    my ($cb, $app, $tmpl) = @_;

    my $settings = MT::Util::encode_html(MT::Util::to_json({ map { $_ => MT::Util::from_json(plugin()->get_config_value($_)) } @settings }));
    $$tmpl =~ s{(data-mt-rich-text-editor-settings)=""}{$1="$settings"}g;

    my $has_markdown_plugin = MT->component('Markdown') ? 1 : 0;
    $$tmpl =~ s{(data-mt-rich-text-editor-has-markdown-plugin)=""}{$1="$has_markdown_plugin"}g;
}

1;
