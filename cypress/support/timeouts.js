export const useLongerTimeouts = Cypress.expose('useLongerTimeouts') === true;
if (useLongerTimeouts) {
    console.warn('Using longer timeouts for Cypress tests');
}
export const minimumNavigationDelayMillis = useLongerTimeouts ? 2000 : 300;
export const externalPageLoadTimeoutMillis = 60_000 * 1.5;
