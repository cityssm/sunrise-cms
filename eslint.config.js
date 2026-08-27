import configWebApp, { defineConfig } from 'eslint-config-cityssm';
const escapedMethods = [
    'cityssm.dateToString',
    'cityssm.escapeHTML',
    'sunrise.getLoadingParagraphHTML',
    'sunrise.getMoveUpDownButtonFieldHTML',
    'sunrise.getSearchResultsPagerHTML',
    'sunrise.getBurialSiteUrl',
    'sunrise.getCemeteryUrl',
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
    rules: {
        '@typescript-eslint/no-unsafe-type-assertion': 'off',
        'browser-security/no-innerhtml': [
            'error', {
                trustedSanitizers: escapedMethods
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
