import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    projectId: '26a4bi'
  }
})
