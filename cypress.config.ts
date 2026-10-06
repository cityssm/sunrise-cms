import { defineConfig } from 'cypress'

// eslint-disable-next-line unicorn/no-top-level-side-effects
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    projectId: '26a4bi',
    specPattern: 'cypress/e2e/**/*.cy.js',

    supportFile: false,

    retries: 10
  },
  expose: {
    useLongerTimeouts: process.env.CYPRESS_USE_LONGER_TIMEOUTS === 'true'
  }
})
