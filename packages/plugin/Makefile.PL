use ExtUtils::MakeMaker;
use YAML;

my $config  = YAML::LoadFile((glob('./plugins/MTRichTextEditor/config.yaml'))[0]);
my $version = $config->{version};

use Getopt::Long 'GetOptions';
GetOptions('build-version=s' => \my $build_version);
if ($build_version) {
    $version .= "+build-$build_version";
}

WriteMakefile(
    NAME     => $config->{name},
    VERSION  => $version,
    SKIP     => [qw(distdir)],
    DISTNAME => $config->{name},
);

sub MY::top_targets {
    my $makefile = << "Makefile";
BUILD_VERSION = $build_version

Makefile

    $makefile .= << 'Makefile';
npm-install:
	npm ci --include=dev

npm-build:
	npm run build

build-js: npm-install npm-build

build-locales:
	mkdir -p mt-static/plugins/$(NAME)/locales
	for f in plugins/$(NAME)/lib/MT/Plugin/$(NAME)/L10N/*.pm; do \
        l=$$(basename $$f .pm); \
        ll=$$(echo $$l | sed -e 's/_.*//g'); \
        mkdir -p mt-static/plugins/$(NAME)/locales/$${ll} ../editor/locales/$${ll}; \
        plugin_locales=mt-static/plugins/$(NAME)/locales/$${ll}/translation.json; \
        editor_locales=../editor/locales/$${ll}/translation.json; \
        \
        json_data=$$(perl -Iplugins/$(NAME)/lib -MJSON -e "BEGIN { package MT::Plugin::L10N { sub new {} } }; use MT::Plugin::$(NAME)::L10N::$$l; print(encode_json(\%MT::Plugin::$(NAME)::L10N::$$l::Lexicon))") || exit 1; \
        echo $$json_data > $$plugin_locales; \
        echo $$json_data > $$editor_locales; \
    done

build: build-js build-locales

create_distdir :
	$(RM_RF) $(DISTVNAME)
	$(PERLRUN) "-MExtUtils::Manifest=manicopy,maniread" \
		-e "manicopy(maniread(),'$(DISTVNAME)', '$(DIST_CP)');"
	if [ -n "$(BUILD_VERSION)" ]; then \
		for f in $(DISTVNAME)/plugins/*/config.yaml; do \
			perl -i -pe '$$_ =~ s/(.*)/$$1+build-$(BUILD_VERSION)/ if /^version:/' $$f; \
		done \
	fi

distdir : create_distdir build
	$(NOECHO) $(NOOP)

manifest : build

Makefile

    $makefile;
}
