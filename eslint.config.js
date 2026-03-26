import eslintCspell from '@cspell/eslint-plugin';
import configWebApp, { defineConfig } from 'eslint-config-cityssm';
import { cspellWords } from 'eslint-config-cityssm/exports';
import eslintPluginNoUnsanitized from 'eslint-plugin-no-unsanitized';
const escapedMethods = [
    'cityssm.escapeHTML',
    'sunrise.getLoadingParagraphHTML',
    'sunrise.getMoveUpDownButtonFieldHTML',
    'sunrise.getSearchResultsPagerHTML',
    'sunrise.getBurialSiteUrl',
    'sunrise.getContractUrl',
    'sunrise.getFuneralHomeUrl',
    'sunrise.getWorkOrderUrl',
    'buildBurialSiteHTML',
    'buildFuneralHomeAddressHTML'
];
export const config = defineConfig(configWebApp, {
    files: ['**/*.ts'],
    languageOptions: {
        parserOptions: {
            projectService: true
        }
    },
    plugins: {
        '@cspell': eslintCspell,
        'no-unsanitized': eslintPluginNoUnsanitized
    },
    rules: {
        '@cspell/spellchecker': [
            'warn',
            {
                cspell: {
                    words: [
                        ...cspellWords,
                        'autoincrement',
                        'consigno',
                        'crosshairs',
                        'esig',
                        'findagrave',
                        'fontawesome',
                        'gapless',
                        'ical',
                        'javascripts',
                        'latlng',
                        'lngs',
                        'noopener',
                        'noreferrer',
                        'ntfy',
                        'onhidden',
                        'pdfa',
                        'preneed'
                    ]
                }
            }
        ],
        '@typescript-eslint/no-unsafe-type-assertion': 'off',
        'no-unsanitized/method': [
            'error',
            {
                escape: {
                    methods: escapedMethods
                }
            }
        ],
        'no-unsanitized/property': [
            'error',
            {
                escape: {
                    methods: escapedMethods
                }
            }
        ]
    }
}, {
    files: ['**/*.md'],
    rules: {
        'markdown/no-missing-label-refs': 'off'
    }
});
export default config;
