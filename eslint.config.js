import { configWebApp, cspellWords, defineConfig } from 'eslint-config-cityssm';
export const config = defineConfig(configWebApp, {
    files: ['**/*.ts'],
    languageOptions: {
        parserOptions: {
            // eslint-disable-next-line @cspell/spellchecker
            project: ['./tsconfig.json', './public/javascripts/tsconfig.json']
        }
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
                        'fontawesome',
                        'gapless',
                        'ical',
                        'latlng',
                        'ntfy',
                        'onhidden',
                        'pdfa',
                        'preneed',
                        'randomcolor'
                    ]
                }
            }
        ],
        '@typescript-eslint/no-unsafe-type-assertion': 'off'
    }
});
export default config;
