import configWebApp, {
  type ConfigObject,
  defineConfig
} from 'eslint-config-cityssm'
import { cspellWords } from 'eslint-config-cityssm/exports'

/* eslint-disable no-secrets/no-secrets */

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
]

/* eslint-enable no-secrets/no-secrets */

export const config: ConfigObject[] = defineConfig(configWebApp, {
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
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
            'esig',
            'fontawesome',
            'gapless',
            'ical',
            'javascripts',
            'latlng',
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
})

export default config
