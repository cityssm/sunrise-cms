import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    projectId: '26a4bi',
    specPattern: 'cypress/e2e/**/*.cy.js',

    allowCypressEnv: false,
    supportFile: false
  },
  env: {
    useLongerTimeouts: process.env.CYPRESS_USE_LONGER_TIMEOUTS === 'true'
  }
})
