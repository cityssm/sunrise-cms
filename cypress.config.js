import { defineConfig } from 'cypress';
export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:7000',
        specPattern: 'cypress/e2e/**/*.cy.js',
        supportFile: false,
        projectId: '26a4bi'
    }
});
