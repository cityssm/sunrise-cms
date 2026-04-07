export const useLongerTimeouts = Cypress.expose('useLongerTimeouts') === true;
if (useLongerTimeouts) {
    console.warn('Using longer timeouts for Cypress tests');
}
export const ajaxTimeoutMillis = useLongerTimeouts ? 3000 : 1000;
export const minimumNavigationDelayMillis = useLongerTimeouts ? 2000 : 300;
export const pageLoadTimeoutMillis = useLongerTimeouts ? 15_000 : 2000;
export const externalPageLoadTimeoutMillis = 10_000;
export const pdfGenerationDelayMillis = 10_000;
