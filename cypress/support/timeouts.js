export const ajaxTimeoutMillis = Cypress.expose('useLongerTimeouts') === true ? 3000 : 1000;
export const minimumNavigationDelayMillis = Cypress.expose('useLongerTimeouts') === true ? 2000 : 300;
export const pageLoadTimeoutMillis = Cypress.expose('useLongerTimeouts') === true ? 15_000 : 2000;
export const externalPageLoadTimeoutMillis = 10_000;
export const pdfGenerationDelayMillis = 10_000;
