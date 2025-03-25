import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    projectId: '26a4bi',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false
  }
})
