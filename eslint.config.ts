import configWebApp, { defineConfig } from 'eslint-config-cityssm'

const escapedMethods = [
  'cityssm.dateToString',
  'cityssm.escapeHTML',

  'sunrise.getLoadingParagraphHtml',
  'sunrise.getMoveUpDownButtonFieldHtml',
  'sunrise.getSearchResultsPagerHtml',

  'sunrise.getBurialSiteUrl',
  'sunrise.getCemeteryUrl',
  'sunrise.getContractUrl',
  'sunrise.getFuneralHomeUrl',
  'sunrise.getWorkOrderUrl',

  'buildBurialSiteHtml',
  'buildCapacityTagHtml',
  'buildFuneralHomeAddressHtml'
]

export default defineConfig([
  configWebApp,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      '@typescript-eslint/no-unsafe-type-assertion': 'off',

      'browser-security/no-innerhtml': [
        'error',
        {
          trustedSanitizers: escapedMethods
        }
      ]
    }
  },
  {
    files: ['**/*.md'],
    rules: {
      'markdown/no-missing-label-refs': 'off'
    }
  }
])
