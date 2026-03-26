export const ajaxTimeoutMillis = Cypress.expose('useLongerTimeouts') === true ? 3000 : 1500;
export const minimumNavigationDelayMillis = Cypress.expose('useLongerTimeouts') === true ? 1000 : 300;
export const pageLoadTimeoutMillis = Cypress.expose('useLongerTimeouts') === true ? 10_000 : 2000;
export const externalPageLoadTimeoutMillis = 10_000;
export const pdfGenerationDelayMillis = 10_000;
