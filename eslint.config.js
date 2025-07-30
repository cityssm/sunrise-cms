import { configWebApp, cspellWords, tseslint } from 'eslint-config-cityssm';
export const config = tseslint.config(configWebApp, {
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
                        'fontawesome',
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
