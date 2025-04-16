import { configWebApp, cspellWords, tseslint } from 'eslint-config-cityssm'

export const config = tseslint.config(...configWebApp, {
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
          words: [...cspellWords, 'autoincrement', 'fontawesome', 'ical', 'preneed', 'ntfy']
        }
      }
    ],
    '@typescript-eslint/no-unsafe-type-assertion': 'off',
  }
})

export default config
